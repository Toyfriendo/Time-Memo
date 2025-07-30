import React, { useState } from 'react';
import { Search, Filter, Grid3X3, List, SortAsc } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import MemoCard from './MemoCard';

const MemoList = ({ memos, onEdit, onDelete, onToggleAlarm }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');

  // Filter and sort memos
  const filteredMemos = memos
    .filter(memo => {
      const matchesSearch = memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          memo.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterType === 'all' || 
                          (filterType === 'text' && !memo.image) ||
                          (filterType === 'image' && memo.image) ||
                          (filterType === 'alarm' && memo.alarm?.enabled);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'alarm':
          if (!a.alarm?.enabled && !b.alarm?.enabled) return 0;
          if (a.alarm?.enabled && !b.alarm?.enabled) return -1;
          if (!a.alarm?.enabled && b.alarm?.enabled) return 1;
          return new Date(a.alarm.time) - new Date(b.alarm.time);
        default:
          return 0;
      }
    });

  const alarmCount = memos.filter(memo => memo.alarm?.enabled).length;
  const imageCount = memos.filter(memo => memo.image).length;

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search memos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="text">Text Only</SelectItem>
              <SelectItem value="image">With Images</SelectItem>
              <SelectItem value="alarm">With Alarms</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="alarm">By Alarm</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex space-x-4 text-sm">
        <Badge variant="secondary" className="flex items-center space-x-1">
          <span>Total: {memos.length}</span>
        </Badge>
        <Badge variant="secondary" className="flex items-center space-x-1">
          <span>Alarms: {alarmCount}</span>
        </Badge>
        <Badge variant="secondary" className="flex items-center space-x-1">
          <span>With Images: {imageCount}</span>
        </Badge>
        <Badge variant="secondary" className="flex items-center space-x-1">
          <span>Found: {filteredMemos.length}</span>
        </Badge>
      </div>

      {/* Memo Grid/List */}
      {filteredMemos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No memos found</h3>
          <p className="text-muted-foreground">
            {searchQuery || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first memo to get started'
            }
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredMemos.map(memo => (
            <MemoCard
              key={memo.id}
              memo={memo}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleAlarm={onToggleAlarm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoList;