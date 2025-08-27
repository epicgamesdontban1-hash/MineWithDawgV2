
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Info, Shield, Code, Users, Clock, AlertTriangle } from 'lucide-react';

interface LearnMoreDialogProps {
  children: React.ReactNode;
}

export function LearnMoreDialog({ children }: LearnMoreDialogProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      id: 'mojang',
      title: 'Mojang Disclaimer',
      icon: <AlertTriangle className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p className="text-gray-300">
            <strong>MineWithDawg is not affiliated with Mojang AB or Microsoft.</strong>
          </p>
          <p className="text-gray-400 text-sm">
            Minecraft is a trademark of Mojang AB. This service is an independent third-party application 
            that connects to Minecraft servers using the official Minecraft protocol. We are not endorsed 
            by, sponsored by, or affiliated with Mojang AB or Microsoft Corporation.
          </p>
          <p className="text-gray-400 text-sm">
            Use of this service is at your own risk and discretion. Please ensure you comply with 
            Minecraft's Terms of Service and End User License Agreement when using this bot.
          </p>
        </div>
      )
    },
    {
      id: 'how-it-works',
      title: 'How This Service Works',
      icon: <Code className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p className="text-gray-300">
            MineWithDawg uses advanced web technologies to create and control Minecraft bots directly from your browser.
          </p>
          <div className="space-y-2">
            <h4 className="text-minecraft-green font-semibold">Technical Overview:</h4>
            <ul className="text-gray-400 text-sm space-y-1 ml-4">
              <li>• Built with Node.js and the Mineflayer library</li>
              <li>• Real-time WebSocket communication</li>
              <li>• Secure server-side bot hosting</li>
              <li>• No client-side installations required</li>
              <li>• Cross-platform web interface</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-minecraft-green font-semibold">Bot Capabilities:</h4>
            <ul className="text-gray-400 text-sm space-y-1 ml-4">
              <li>• Connect to any Minecraft Java Edition server</li>
              <li>• Send chat messages and commands</li>
              <li>• Receive real-time server updates</li>
              <li>• Monitor server status and player activity</li>
              <li>• Auto-reconnection on connection loss</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'privacy',
      title: 'Privacy & Data Protection',
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p className="text-gray-300">
            Your privacy and data security are our top priorities.
          </p>
          <div className="space-y-2">
            <h4 className="text-minecraft-green font-semibold">Data We Collect:</h4>
            <ul className="text-gray-400 text-sm space-y-1 ml-4">
              <li>• Account credentials (username/password) - securely hashed</li>
              <li>• Server connection details you provide</li>
              <li>• Bot activity logs for debugging purposes</li>
              <li>• Basic usage analytics (anonymous)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-minecraft-green font-semibold">Data We Don't Collect:</h4>
            <ul className="text-gray-400 text-sm space-y-1 ml-4">
              <li>• Your Minecraft account credentials</li>
              <li>• Personal information beyond username</li>
              <li>• Chat content from servers</li>
              <li>• IP addresses or location data</li>
            </ul>
          </div>
          <p className="text-gray-400 text-sm">
            All data is stored securely and never shared with third parties. You can delete your account 
            and all associated data at any time.
          </p>
        </div>
      )
    },
    {
      id: 'safety',
      title: 'Account Safety',
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p className="text-gray-300">
            We implement multiple security measures to protect your account and bot activities.
          </p>
          <div className="space-y-2">
            <h4 className="text-minecraft-green font-semibold">Security Features:</h4>
            <ul className="text-gray-400 text-sm space-y-1 ml-4">
              <li>• Password hashing with bcrypt encryption</li>
              <li>• Secure session management</li>
              <li>• HTTPS/WSS encrypted connections</li>
              <li>• Rate limiting and abuse protection</li>
              <li>• Automatic session timeout</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-minecraft-green font-semibold">Best Practices:</h4>
            <ul className="text-gray-400 text-sm space-y-1 ml-4">
              <li>• Use a unique password for your MineWithDawg account</li>
              <li>• Don't share your account credentials</li>
              <li>• Log out when using shared computers</li>
              <li>• Report any suspicious activity immediately</li>
            </ul>
          </div>
          <p className="text-yellow-400 text-sm">
            <strong>Important:</strong> This service does not require your Minecraft account credentials. 
            Never enter your Minecraft password here!
          </p>
        </div>
      )
    },
    {
      id: 'updates',
      title: 'Recent Updates - Version 2.0',
      icon: <Clock className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p className="text-gray-300">
            MineWithDawg v2 brings major improvements and new features.
          </p>
          <div className="space-y-2">
            <h4 className="text-minecraft-green font-semibold">What's New in v2:</h4>
            <ul className="text-gray-400 text-sm space-y-1 ml-4">
              <li>• Complete UI redesign with improved UX</li>
              <li>• User account system with login/registration</li>
              <li>• Server profile management and saving</li>
              <li>• Enhanced real-time monitoring</li>
              <li>• Improved error handling and logging</li>
              <li>• Better mobile responsiveness</li>
              <li>• Auto-reconnection capabilities</li>
              <li>• Performance optimizations</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-minecraft-green font-semibold">Coming Soon:</h4>
            <ul className="text-gray-400 text-sm space-y-1 ml-4">
              <li>• Plugin system for custom bot behaviors</li>
              <li>• Advanced chat filtering and moderation</li>
              <li>• Multi-bot management</li>
              <li>• Discord integration</li>
              <li>• Scheduled bot actions</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'developer',
      title: 'Developer Information',
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p className="text-gray-300">
            Learn about the team behind MineWithDawg and our mission.
          </p>
          <div className="space-y-2">
            <h4 className="text-minecraft-green font-semibold">About the Developer:</h4>
            <p className="text-gray-400 text-sm">
              MineWithDawg is developed by <span className="text-minecraft-green">doggo</span>, 
              a passionate developer who loves Minecraft and creating useful tools for the community.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-minecraft-green font-semibold">Our Mission:</h4>
            <p className="text-gray-400 text-sm">
              To create the first and best free Minecraft bot service that runs entirely through the web. 
              Our goal is to make bot creation and management accessible to everyone, regardless of 
              technical expertise or hardware limitations.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-minecraft-green font-semibold">Why Free?</h4>
            <p className="text-gray-400 text-sm">
              This project was created for fun and to give back to the Minecraft community. 
              We believe that useful tools should be accessible to everyone, not just those who can afford them.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-minecraft-green font-semibold">Open Source:</h4>
            <p className="text-gray-400 text-sm">
              MineWithDawg is built with modern web technologies including React, TypeScript, Node.js, 
              and WebSocket. We're committed to transparency and may open-source parts of the project in the future.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] bg-gray-800 border-gray-700 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-minecraft-green flex items-center gap-2">
            <Info className="w-6 h-6" />
            Learn More About MineWithDawg v2
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 min-h-0 pr-4">
          <div className="space-y-4">
            {sections.map((section) => (
              <Collapsible
                key={section.id}
                open={openSection === section.id}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto bg-gray-700 hover:bg-gray-600 border border-gray-600"
                  >
                    <div className="flex items-center gap-3">
                      {section.icon}
                      <span className="text-lg font-semibold">{section.title}</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        openSection === section.id ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 border-l-2 border-minecraft-green/30 ml-6 mt-2 overflow-hidden">
                  <div className="space-y-2">
                    {section.content}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
          <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600 flex-shrink-0">
            <p className="text-center text-gray-400 text-sm">
              Have questions or feedback? We'd love to hear from you!
              <br />
              <span className="text-minecraft-green">Version 2.0.0</span> • Built with ❤️ for the Minecraft community
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
