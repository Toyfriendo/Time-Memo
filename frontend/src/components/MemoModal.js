import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Camera, Upload, X, Bell, Clock } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const MemoModal = ({ isOpen, onClose, memo, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [alarmTime, setAlarmTime] = useState('');
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (memo) {
      setTitle(memo.title || '');
      setContent(memo.content || '');
      setImage(memo.image);
      setImagePreview(memo.image);
      setAlarmEnabled(memo.alarm?.enabled || false);
      if (memo.alarm?.time) {
        const date = new Date(memo.alarm.time);
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString().slice(0, 16);
        setAlarmTime(localDateTime);
      }
    } else {
      resetForm();
    }
  }, [memo]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImage(null);
    setImagePreview(null);
    setAlarmEnabled(false);
    setAlarmTime('');
    stopCamera();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setImage(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setIsCapturing(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setImage(imageData);
      setImagePreview(imageData);
      stopCamera();
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your memo",
        variant: "destructive"
      });
      return;
    }

    const memoData = {
      title: title.trim(),
      content: content.trim(),
      image,
      alarm: {
        enabled: alarmEnabled,
        time: alarmEnabled && alarmTime ? new Date(alarmTime).toISOString() : null
      },
      type: image ? 'image' : 'text'
    };

    onSave(memoData);
    toast({
      title: "Success",
      description: memo ? "Memo updated successfully" : "Memo created successfully"
    });
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {memo ? 'Edit Memo' : 'Create New Memo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter memo title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your memo here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Image Section */}
          <div className="space-y-3">
            <Label>Image (Optional)</Label>
            
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={startCamera}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}

            {isCapturing && (
              <div className="space-y-2">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1"
                  >
                    Capture Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={stopCamera}
                  >
                    Cancel
                  </Button>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
          </div>

          {/* Alarm Section */}
          <div className="space-y-3 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="alarm">Set Alarm</Label>
              </div>
              <Switch
                id="alarm"
                checked={alarmEnabled}
                onCheckedChange={setAlarmEnabled}
              />
            </div>
            
            {alarmEnabled && (
              <div className="space-y-2">
                <Label htmlFor="alarmTime">Alarm Time</Label>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="alarmTime"
                    type="datetime-local"
                    value={alarmTime}
                    onChange={(e) => setAlarmTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {memo ? 'Update Memo' : 'Create Memo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MemoModal;