
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Save, Trash2, Plus, Server } from 'lucide-react';

interface ServerProfile {
  id: string;
  profileName: string;
  username: string;
  serverIp: string;
  version: string;
  authMode: string;
  messageOnLoad?: string;
  messageOnLoadDelay: number;
}

interface ServerProfileManagerProps {
  userId: string;
  onLoadProfile: (profile: ServerProfile) => void;
  currentValues?: {
    username: string;
    serverIP: string;
    version: string;
    authMode: string;
    messageOnLoad: string;
    messageOnLoadDelay: number;
  };
}

const MINECRAFT_VERSIONS = [
  '1.21.4', '1.21.3', '1.21.2', '1.21.1', '1.21.0',
  '1.20.6', '1.20.4', '1.20.2', '1.20.1',
  '1.19.4', '1.19.2', '1.18.2'
];

export function ServerProfileManager({ userId, onLoadProfile, currentValues }: ServerProfileManagerProps) {
  const [profiles, setProfiles] = useState<ServerProfile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, [userId]);

  const loadProfiles = async () => {
    try {
      const response = await fetch(`/api/profiles/user/${userId}`);
      if (response.ok) {
        const profilesData = await response.json();
        setProfiles(profilesData);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  const saveCurrentAsProfile = async () => {
    if (!profileName.trim() || !currentValues) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          profileName: profileName.trim(),
          username: currentValues.username,
          serverIp: currentValues.serverIP,
          version: currentValues.version,
          authMode: currentValues.authMode,
          messageOnLoad: currentValues.messageOnLoad,
          messageOnLoadDelay: currentValues.messageOnLoadDelay,
        }),
      });

      if (response.ok) {
        setProfileName('');
        setIsCreating(false);
        await loadProfiles();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProfile = async (profileId: string) => {
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadProfiles();
      }
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  return (
    <Card className="bg-gray-800 border-minecraft-dark-stone">
      <CardHeader>
        <CardTitle className="text-xl font-gaming font-bold text-minecraft-green flex items-center">
          <Server className="mr-2" />
          Server Profiles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Saved Profiles */}
        <div className="space-y-2">
          {profiles.length === 0 ? (
            <div className="text-gray-400 text-center py-4">
              No saved profiles yet
            </div>
          ) : (
            profiles.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                <div className="flex-1">
                  <div className="font-semibold text-white">{profile.profileName}</div>
                  <div className="text-sm text-gray-400">
                    {profile.username} @ {profile.serverIp} ({profile.version})
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => onLoadProfile(profile)}
                    className="bg-minecraft-green hover:bg-minecraft-dark-green"
                  >
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteProfile(profile.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create New Profile */}
        {isCreating ? (
          <div className="space-y-3 bg-gray-700 rounded-lg p-4">
            <Label htmlFor="profileName" className="text-gray-300">Profile Name</Label>
            <Input
              id="profileName"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Enter profile name"
              className="bg-gray-600 border-gray-500 text-white"
            />
            <div className="flex space-x-2">
              <Button
                onClick={saveCurrentAsProfile}
                disabled={!profileName.trim() || isLoading}
                className="bg-minecraft-green hover:bg-minecraft-dark-green flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setProfileName('');
                }}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsCreating(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Save Current Settings as Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
