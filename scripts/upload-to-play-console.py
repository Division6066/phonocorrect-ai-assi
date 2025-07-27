#!/usr/bin/env python3
"""
Google Play Console Upload Script
Uploads APK/AAB files to Google Play Console using the Google Play Developer API
"""

import os
import sys
import argparse
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import time

class PlayConsoleUploader:
    def __init__(self, service_account_file: str):
        """Initialize the uploader with service account credentials."""
        self.service_account_file = service_account_file
        self.service = None
        self._authenticate()

    def _authenticate(self):
        """Authenticate with Google Play Console API."""
        try:
            credentials = service_account.Credentials.from_service_account_file(
                self.service_account_file,
                scopes=['https://www.googleapis.com/auth/androidpublisher']
            )
            self.service = build('androidpublisher', 'v3', credentials=credentials)
            print("✅ Successfully authenticated with Google Play Console")
        except Exception as e:
            print(f"❌ Authentication failed: {e}")
            sys.exit(1)

    def upload_apk(self, package_name: str, apk_path: str, track: str = 'internal', 
                   version_name: str = None, version_code: int = None):
        """Upload APK to Google Play Console."""
        try:
            print(f"🚀 Starting upload to {track} track...")
            
            # Start edit transaction
            edit_request = self.service.edits().insert(body={}, packageName=package_name)
            edit_result = edit_request.execute()
            edit_id = edit_result['id']
            print(f"📝 Created edit transaction: {edit_id}")

            # Upload APK
            print(f"📦 Uploading APK: {apk_path}")
            media = MediaFileUpload(apk_path, mimetype='application/vnd.android.package-archive')
            upload_request = self.service.edits().apks().upload(
                editId=edit_id,
                packageName=package_name,
                media_body=media
            )
            upload_result = upload_request.execute()
            version_code = upload_result['versionCode']
            print(f"✅ APK uploaded successfully. Version code: {version_code}")

            # Assign to track
            print(f"🎯 Assigning to {track} track...")
            track_request = self.service.edits().tracks().update(
                editId=edit_id,
                packageName=package_name,
                track=track,
                body={
                    'releases': [{
                        'versionCodes': [version_code],
                        'status': 'completed'
                    }]
                }
            )
            track_result = track_request.execute()
            print(f"✅ Assigned to {track} track successfully")

            # Commit the edit
            print("💾 Committing changes...")
            commit_request = self.service.edits().commit(
                editId=edit_id,
                packageName=package_name
            )
            commit_result = commit_request.execute()
            print(f"✅ Changes committed successfully: {commit_result['id']}")

            return {
                'version_code': version_code,
                'track': track,
                'edit_id': commit_result['id']
            }

        except Exception as e:
            print(f"❌ Upload failed: {e}")
            # Try to abort the edit transaction
            try:
                self.service.edits().delete(editId=edit_id, packageName=package_name).execute()
                print("🗑️ Edit transaction aborted")
            except:
                pass
            sys.exit(1)

    def upload_aab(self, package_name: str, aab_path: str, track: str = 'internal',
                   version_name: str = None, version_code: int = None):
        """Upload AAB to Google Play Console."""
        try:
            print(f"🚀 Starting AAB upload to {track} track...")
            
            # Start edit transaction
            edit_request = self.service.edits().insert(body={}, packageName=package_name)
            edit_result = edit_request.execute()
            edit_id = edit_result['id']
            print(f"📝 Created edit transaction: {edit_id}")

            # Upload AAB (App Bundle)
            print(f"📦 Uploading AAB: {aab_path}")
            media = MediaFileUpload(aab_path, mimetype='application/octet-stream')
            upload_request = self.service.edits().bundles().upload(
                editId=edit_id,
                packageName=package_name,
                media_body=media
            )
            upload_result = upload_request.execute()
            version_code = upload_result['versionCode']
            print(f"✅ AAB uploaded successfully. Version code: {version_code}")

            # Assign to track
            print(f"🎯 Assigning to {track} track...")
            track_request = self.service.edits().tracks().update(
                editId=edit_id,
                packageName=package_name,
                track=track,
                body={
                    'releases': [{
                        'versionCodes': [version_code],
                        'status': 'completed'
                    }]
                }
            )
            track_result = track_request.execute()
            print(f"✅ Assigned to {track} track successfully")

            # Commit the edit
            print("💾 Committing changes...")
            commit_request = self.service.edits().commit(
                editId=edit_id,
                packageName=package_name
            )
            commit_result = commit_request.execute()
            print(f"✅ Changes committed successfully: {commit_result['id']}")

            return {
                'version_code': version_code,
                'track': track,
                'edit_id': commit_result['id']
            }

        except Exception as e:
            print(f"❌ Upload failed: {e}")
            # Try to abort the edit transaction
            try:
                self.service.edits().delete(editId=edit_id, packageName=package_name).execute()
                print("🗑️ Edit transaction aborted")
            except:
                pass
            sys.exit(1)

    def get_tracks(self, package_name: str):
        """Get available tracks for the app."""
        try:
            edit_request = self.service.edits().insert(body={}, packageName=package_name)
            edit_result = edit_request.execute()
            edit_id = edit_result['id']

            tracks_request = self.service.edits().tracks().list(
                editId=edit_id,
                packageName=package_name
            )
            tracks_result = tracks_request.execute()

            # Abort the edit transaction
            self.service.edits().delete(editId=edit_id, packageName=package_name).execute()

            return tracks_result.get('tracks', [])

        except Exception as e:
            print(f"❌ Failed to get tracks: {e}")
            return []

    def validate_setup(self, package_name: str):
        """Validate that the service account has proper permissions."""
        try:
            print("🔍 Validating Google Play Console setup...")
            
            # Try to create an edit transaction
            edit_request = self.service.edits().insert(body={}, packageName=package_name)
            edit_result = edit_request.execute()
            edit_id = edit_result['id']
            print("✅ Can create edit transactions")

            # Check available tracks
            tracks = self.get_tracks(package_name)
            print(f"✅ Available tracks: {[track['track'] for track in tracks]}")

            # Clean up
            self.service.edits().delete(editId=edit_id, packageName=package_name).execute()
            print("✅ Validation completed successfully")

            return True

        except Exception as e:
            print(f"❌ Validation failed: {e}")
            print("💡 Check that:")
            print("   - The service account has the correct permissions")
            print("   - The package name is correct")
            print("   - The app exists in Google Play Console")
            return False

def main():
    parser = argparse.ArgumentParser(description='Upload APK/AAB to Google Play Console')
    parser.add_argument('--service-account', required=True, 
                        help='Path to service account JSON file')
    parser.add_argument('--package-name', required=True, 
                        help='Android package name (e.g., com.example.app)')
    parser.add_argument('--apk', help='Path to APK file')
    parser.add_argument('--aab', help='Path to AAB file')
    parser.add_argument('--track', default='internal', 
                        choices=['internal', 'alpha', 'beta', 'production'],
                        help='Release track')
    parser.add_argument('--validate', action='store_true',
                        help='Validate setup without uploading')
    parser.add_argument('--list-tracks', action='store_true',
                        help='List available tracks')

    args = parser.parse_args()

    # Validate arguments
    if not args.validate and not args.list_tracks and not args.apk and not args.aab:
        print("❌ Either --apk or --aab must be specified (unless using --validate or --list-tracks)")
        sys.exit(1)

    if args.apk and args.aab:
        print("❌ Cannot specify both --apk and --aab")
        sys.exit(1)

    # Check files exist
    if not os.path.exists(args.service_account):
        print(f"❌ Service account file not found: {args.service_account}")
        sys.exit(1)

    if args.apk and not os.path.exists(args.apk):
        print(f"❌ APK file not found: {args.apk}")
        sys.exit(1)

    if args.aab and not os.path.exists(args.aab):
        print(f"❌ AAB file not found: {args.aab}")
        sys.exit(1)

    # Initialize uploader
    uploader = PlayConsoleUploader(args.service_account)

    # Handle different actions
    if args.validate:
        success = uploader.validate_setup(args.package_name)
        sys.exit(0 if success else 1)

    if args.list_tracks:
        tracks = uploader.get_tracks(args.package_name)
        print("📋 Available tracks:")
        for track in tracks:
            print(f"  - {track['track']}")
        sys.exit(0)

    # Upload file
    try:
        if args.apk:
            result = uploader.upload_apk(args.package_name, args.apk, args.track)
        else:
            result = uploader.upload_aab(args.package_name, args.aab, args.track)

        print("\n🎉 Upload completed successfully!")
        print(f"📱 Version Code: {result['version_code']}")
        print(f"🎯 Track: {result['track']}")
        print(f"📝 Edit ID: {result['edit_id']}")

    except Exception as e:
        print(f"❌ Upload failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()