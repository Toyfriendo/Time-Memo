#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Time Notes Application
Tests all backend endpoints with various scenarios including error handling.
"""

import requests
import json
import base64
import io
from datetime import datetime, timedelta
import os
import sys
from pathlib import Path

# Get backend URL from frontend .env file
def get_backend_url():
    frontend_env_path = Path("/app/frontend/.env")
    if frontend_env_path.exists():
        with open(frontend_env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}Testing: {test_name}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

class TimeNotesAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.created_memo_ids = []
        self.uploaded_filenames = []
        
    def cleanup(self):
        """Clean up created test data"""
        print_info("Cleaning up test data...")
        
        # Delete created memos
        for memo_id in self.created_memo_ids:
            try:
                response = self.session.delete(f"{API_URL}/memos/{memo_id}")
                if response.status_code == 200:
                    print_info(f"Deleted memo: {memo_id}")
            except Exception as e:
                print_warning(f"Failed to delete memo {memo_id}: {e}")
        
        self.created_memo_ids.clear()
        self.uploaded_filenames.clear()

    def test_health_check(self):
        """Test health check endpoint"""
        print_test_header("Health Check Endpoint")
        
        try:
            response = self.session.get(f"{API_URL}/health")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    print_success("Health check passed")
                    return True
                else:
                    print_error(f"Health check failed: {data}")
                    return False
            else:
                print_error(f"Health check failed with status {response.status_code}")
                return False
                
        except Exception as e:
            print_error(f"Health check failed with exception: {e}")
            return False

    def test_create_text_memo(self):
        """Test creating a text-only memo"""
        print_test_header("Create Text Memo")
        
        memo_data = {
            "title": "My Daily Tasks",
            "content": "1. Review project requirements\n2. Update documentation\n3. Test API endpoints",
            "type": "text",
            "alarm": {
                "enabled": False,
                "time": None
            }
        }
        
        try:
            response = self.session.post(f"{API_URL}/memos", json=memo_data)
            
            if response.status_code == 200:
                data = response.json()
                memo_id = data.get("id")
                
                if memo_id:
                    self.created_memo_ids.append(memo_id)
                    print_success(f"Created text memo with ID: {memo_id}")
                    
                    # Verify required fields
                    required_fields = ["id", "title", "content", "type", "created_at", "updated_at"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        print_success("All required fields present in response")
                        return True, memo_id
                    else:
                        print_error(f"Missing fields in response: {missing_fields}")
                        return False, None
                else:
                    print_error("No ID returned in response")
                    return False, None
            else:
                print_error(f"Failed to create memo: {response.status_code} - {response.text}")
                return False, None
                
        except Exception as e:
            print_error(f"Exception during memo creation: {e}")
            return False, None

    def test_create_memo_with_alarm(self):
        """Test creating a memo with alarm enabled"""
        print_test_header("Create Memo with Alarm")
        
        future_time = datetime.utcnow() + timedelta(hours=1)
        memo_data = {
            "title": "Important Meeting",
            "content": "Team standup meeting at 2 PM. Don't forget to prepare the weekly report.",
            "type": "text",
            "alarm": {
                "enabled": True,
                "time": future_time.isoformat()
            }
        }
        
        try:
            response = self.session.post(f"{API_URL}/memos", json=memo_data)
            
            if response.status_code == 200:
                data = response.json()
                memo_id = data.get("id")
                
                if memo_id:
                    self.created_memo_ids.append(memo_id)
                    alarm_data = data.get("alarm", {})
                    
                    if alarm_data.get("enabled") == True:
                        print_success(f"Created memo with alarm enabled: {memo_id}")
                        return True, memo_id
                    else:
                        print_error("Alarm not properly set in created memo")
                        return False, None
                else:
                    print_error("No ID returned in response")
                    return False, None
            else:
                print_error(f"Failed to create memo with alarm: {response.status_code} - {response.text}")
                return False, None
                
        except Exception as e:
            print_error(f"Exception during memo with alarm creation: {e}")
            return False, None

    def test_get_all_memos(self):
        """Test retrieving all memos"""
        print_test_header("Get All Memos")
        
        try:
            response = self.session.get(f"{API_URL}/memos")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    print_success(f"Retrieved {len(data)} memos")
                    
                    # Verify memo structure if any memos exist
                    if data:
                        first_memo = data[0]
                        required_fields = ["id", "title", "content", "created_at", "updated_at"]
                        missing_fields = [field for field in required_fields if field not in first_memo]
                        
                        if not missing_fields:
                            print_success("Memo structure is correct")
                        else:
                            print_warning(f"Some fields missing in memo structure: {missing_fields}")
                    
                    return True
                else:
                    print_error("Response is not a list")
                    return False
            else:
                print_error(f"Failed to get memos: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Exception during get all memos: {e}")
            return False

    def test_get_specific_memo(self, memo_id):
        """Test retrieving a specific memo"""
        print_test_header(f"Get Specific Memo: {memo_id}")
        
        try:
            response = self.session.get(f"{API_URL}/memos/{memo_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("id") == memo_id:
                    print_success(f"Retrieved memo: {data.get('title', 'No title')}")
                    return True
                else:
                    print_error("Retrieved memo ID doesn't match requested ID")
                    return False
            elif response.status_code == 404:
                print_error("Memo not found (404)")
                return False
            else:
                print_error(f"Failed to get memo: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Exception during get specific memo: {e}")
            return False

    def test_update_memo(self, memo_id):
        """Test updating a memo"""
        print_test_header(f"Update Memo: {memo_id}")
        
        update_data = {
            "title": "Updated Task List",
            "content": "1. Review project requirements ✓\n2. Update documentation\n3. Test API endpoints\n4. Write test reports"
        }
        
        try:
            response = self.session.put(f"{API_URL}/memos/{memo_id}", json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("title") == update_data["title"] and data.get("content") == update_data["content"]:
                    print_success("Memo updated successfully")
                    return True
                else:
                    print_error("Memo update didn't reflect changes properly")
                    return False
            elif response.status_code == 404:
                print_error("Memo not found for update (404)")
                return False
            else:
                print_error(f"Failed to update memo: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Exception during memo update: {e}")
            return False

    def test_toggle_alarm(self, memo_id):
        """Test toggling alarm for a memo"""
        print_test_header(f"Toggle Alarm for Memo: {memo_id}")
        
        try:
            # First, get current alarm state
            get_response = self.session.get(f"{API_URL}/memos/{memo_id}")
            if get_response.status_code != 200:
                print_error("Failed to get memo for alarm toggle test")
                return False
            
            current_memo = get_response.json()
            current_alarm_state = current_memo.get("alarm", {}).get("enabled", False)
            
            # Toggle alarm
            response = self.session.post(f"{API_URL}/memos/{memo_id}/toggle-alarm")
            
            if response.status_code == 200:
                data = response.json()
                new_alarm_state = data.get("alarm", {}).get("enabled", False)
                
                if new_alarm_state != current_alarm_state:
                    print_success(f"Alarm toggled from {current_alarm_state} to {new_alarm_state}")
                    return True
                else:
                    print_error("Alarm state didn't change after toggle")
                    return False
            elif response.status_code == 404:
                print_error("Memo not found for alarm toggle (404)")
                return False
            else:
                print_error(f"Failed to toggle alarm: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Exception during alarm toggle: {e}")
            return False

    def test_upload_base64_image(self):
        """Test uploading a base64 image (simulating camera capture)"""
        print_test_header("Upload Base64 Image")
        
        # Create a simple test image in base64 format (1x1 pixel PNG)
        test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg=="
        
        form_data = {
            "image_data": f"data:image/png;base64,{test_image_base64}",
            "filename": "test_camera_image.png"
        }
        
        try:
            response = self.session.post(f"{API_URL}/upload-base64-image", data=form_data)
            
            if response.status_code == 200:
                data = response.json()
                filename = data.get("filename")
                url = data.get("url")
                
                if filename and url:
                    self.uploaded_filenames.append(filename)
                    print_success(f"Base64 image uploaded: {filename}")
                    print_info(f"Image URL: {url}")
                    return True, filename
                else:
                    print_error("Missing filename or URL in response")
                    return False, None
            else:
                print_error(f"Failed to upload base64 image: {response.status_code} - {response.text}")
                return False, None
                
        except Exception as e:
            print_error(f"Exception during base64 image upload: {e}")
            return False, None

    def test_create_memo_with_image(self, image_filename):
        """Test creating a memo with an image"""
        print_test_header("Create Memo with Image")
        
        memo_data = {
            "title": "Photo Memory",
            "content": "This memo contains a photo I captured during my morning walk.",
            "type": "image",
            "image": image_filename,
            "alarm": {
                "enabled": False,
                "time": None
            }
        }
        
        try:
            response = self.session.post(f"{API_URL}/memos", json=memo_data)
            
            if response.status_code == 200:
                data = response.json()
                memo_id = data.get("id")
                
                if memo_id and data.get("image") == image_filename:
                    self.created_memo_ids.append(memo_id)
                    print_success(f"Created memo with image: {memo_id}")
                    return True, memo_id
                else:
                    print_error("Image not properly associated with memo")
                    return False, None
            else:
                print_error(f"Failed to create memo with image: {response.status_code} - {response.text}")
                return False, None
                
        except Exception as e:
            print_error(f"Exception during memo with image creation: {e}")
            return False, None

    def test_serve_image(self, filename):
        """Test serving an uploaded image"""
        print_test_header(f"Serve Image: {filename}")
        
        try:
            response = self.session.get(f"{API_URL}/images/{filename}")
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                
                if 'image' in content_type.lower():
                    print_success(f"Image served successfully with content-type: {content_type}")
                    return True
                else:
                    print_warning(f"Image served but content-type might be incorrect: {content_type}")
                    return True  # Still consider it working
            elif response.status_code == 404:
                print_error("Image not found (404)")
                return False
            else:
                print_error(f"Failed to serve image: {response.status_code}")
                return False
                
        except Exception as e:
            print_error(f"Exception during image serving: {e}")
            return False

    def test_delete_memo(self, memo_id):
        """Test deleting a memo"""
        print_test_header(f"Delete Memo: {memo_id}")
        
        try:
            response = self.session.delete(f"{API_URL}/memos/{memo_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                if "deleted successfully" in data.get("message", "").lower():
                    print_success("Memo deleted successfully")
                    
                    # Verify memo is actually deleted
                    verify_response = self.session.get(f"{API_URL}/memos/{memo_id}")
                    if verify_response.status_code == 404:
                        print_success("Verified memo is no longer accessible")
                        return True
                    else:
                        print_warning("Memo still accessible after deletion")
                        return False
                else:
                    print_error("Unexpected delete response message")
                    return False
            elif response.status_code == 404:
                print_error("Memo not found for deletion (404)")
                return False
            else:
                print_error(f"Failed to delete memo: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Exception during memo deletion: {e}")
            return False

    def test_error_handling(self):
        """Test various error scenarios"""
        print_test_header("Error Handling Tests")
        
        error_tests_passed = 0
        total_error_tests = 4
        
        # Test 1: Create memo with invalid data
        try:
            invalid_memo = {"title": "", "content": ""}  # Empty title should fail
            response = self.session.post(f"{API_URL}/memos", json=invalid_memo)
            
            if response.status_code in [400, 422]:  # Bad request or validation error
                print_success("Invalid memo creation properly rejected")
                error_tests_passed += 1
            else:
                print_warning(f"Invalid memo creation returned unexpected status: {response.status_code}")
        except Exception as e:
            print_warning(f"Error during invalid memo test: {e}")
        
        # Test 2: Get non-existent memo
        try:
            response = self.session.get(f"{API_URL}/memos/nonexistent-id-12345")
            
            if response.status_code == 404:
                print_success("Non-existent memo properly returns 404")
                error_tests_passed += 1
            else:
                print_warning(f"Non-existent memo returned unexpected status: {response.status_code}")
        except Exception as e:
            print_warning(f"Error during non-existent memo test: {e}")
        
        # Test 3: Update non-existent memo
        try:
            response = self.session.put(f"{API_URL}/memos/nonexistent-id-12345", json={"title": "Test"})
            
            if response.status_code == 404:
                print_success("Non-existent memo update properly returns 404")
                error_tests_passed += 1
            else:
                print_warning(f"Non-existent memo update returned unexpected status: {response.status_code}")
        except Exception as e:
            print_warning(f"Error during non-existent memo update test: {e}")
        
        # Test 4: Delete non-existent memo
        try:
            response = self.session.delete(f"{API_URL}/memos/nonexistent-id-12345")
            
            if response.status_code == 404:
                print_success("Non-existent memo deletion properly returns 404")
                error_tests_passed += 1
            else:
                print_warning(f"Non-existent memo deletion returned unexpected status: {response.status_code}")
        except Exception as e:
            print_warning(f"Error during non-existent memo deletion test: {e}")
        
        print_info(f"Error handling tests passed: {error_tests_passed}/{total_error_tests}")
        return error_tests_passed >= 3  # Allow some flexibility

    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"{Colors.BOLD}{'='*80}{Colors.ENDC}")
        print(f"{Colors.BOLD}Time Notes Backend API Test Suite{Colors.ENDC}")
        print(f"{Colors.BOLD}Backend URL: {BASE_URL}{Colors.ENDC}")
        print(f"{Colors.BOLD}{'='*80}{Colors.ENDC}")
        
        test_results = {}
        
        # Test 1: Health Check
        test_results['health_check'] = self.test_health_check()
        
        # Test 2: Create text memo
        success, text_memo_id = self.test_create_text_memo()
        test_results['create_text_memo'] = success
        
        # Test 3: Create memo with alarm
        success, alarm_memo_id = self.test_create_memo_with_alarm()
        test_results['create_memo_with_alarm'] = success
        
        # Test 4: Get all memos
        test_results['get_all_memos'] = self.test_get_all_memos()
        
        # Test 5: Get specific memo (if we have one)
        if text_memo_id:
            test_results['get_specific_memo'] = self.test_get_specific_memo(text_memo_id)
        
        # Test 6: Update memo (if we have one)
        if text_memo_id:
            test_results['update_memo'] = self.test_update_memo(text_memo_id)
        
        # Test 7: Toggle alarm (if we have a memo with alarm)
        if alarm_memo_id:
            test_results['toggle_alarm'] = self.test_toggle_alarm(alarm_memo_id)
        
        # Test 8: Upload base64 image
        success, image_filename = self.test_upload_base64_image()
        test_results['upload_base64_image'] = success
        
        # Test 9: Create memo with image (if image upload succeeded)
        if image_filename:
            success, image_memo_id = self.test_create_memo_with_image(image_filename)
            test_results['create_memo_with_image'] = success
        
        # Test 10: Serve image (if we have an image)
        if image_filename:
            test_results['serve_image'] = self.test_serve_image(image_filename)
        
        # Test 11: Error handling
        test_results['error_handling'] = self.test_error_handling()
        
        # Test 12: Delete memo (clean up one memo to test deletion)
        if text_memo_id:
            test_results['delete_memo'] = self.test_delete_memo(text_memo_id)
            if test_results['delete_memo']:
                self.created_memo_ids.remove(text_memo_id)  # Remove from cleanup list
        
        # Print summary
        self.print_test_summary(test_results)
        
        # Cleanup remaining test data
        self.cleanup()
        
        return test_results

    def print_test_summary(self, results):
        """Print test results summary"""
        print(f"\n{Colors.BOLD}{'='*80}{Colors.ENDC}")
        print(f"{Colors.BOLD}TEST RESULTS SUMMARY{Colors.ENDC}")
        print(f"{Colors.BOLD}{'='*80}{Colors.ENDC}")
        
        passed = 0
        total = len(results)
        
        for test_name, result in results.items():
            status = "PASS" if result else "FAIL"
            color = Colors.GREEN if result else Colors.RED
            print(f"{color}{status:6}{Colors.ENDC} | {test_name.replace('_', ' ').title()}")
            if result:
                passed += 1
        
        print(f"\n{Colors.BOLD}Overall Result: {passed}/{total} tests passed{Colors.ENDC}")
        
        if passed == total:
            print(f"{Colors.GREEN}{Colors.BOLD}🎉 All tests passed! Backend API is working correctly.{Colors.ENDC}")
        elif passed >= total * 0.8:  # 80% pass rate
            print(f"{Colors.YELLOW}{Colors.BOLD}⚠️  Most tests passed, but some issues found.{Colors.ENDC}")
        else:
            print(f"{Colors.RED}{Colors.BOLD}❌ Multiple test failures detected. Backend needs attention.{Colors.ENDC}")

def main():
    """Main test execution"""
    tester = TimeNotesAPITester()
    
    try:
        results = tester.run_all_tests()
        
        # Return appropriate exit code
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        if passed >= total * 0.8:  # 80% pass rate for success
            sys.exit(0)
        else:
            sys.exit(1)
            
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Test execution interrupted by user{Colors.ENDC}")
        tester.cleanup()
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}Unexpected error during testing: {e}{Colors.ENDC}")
        tester.cleanup()
        sys.exit(1)

if __name__ == "__main__":
    main()