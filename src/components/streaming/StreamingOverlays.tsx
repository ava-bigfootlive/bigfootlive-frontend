import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

import {
  Settings,
  Star,
  Gift,
  DollarSign,
  X,
  Zap,
} from 'lucide-react';

interface DonationAlert {
  id: string;
  donorName: string;
  amount: number;
  message?: string;
  timestamp: Date;
  currency: string;
}

interface StreamingOverlaysProps {
  isLive: boolean;
  donations: DonationAlert[];
  onDismissAlert: (id: string) => void;
}

export function StreamingOverlays({ 
  isLive, 
  donations, 
  onDismissAlert 
}: StreamingOverlaysProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showDonations, setShowDonations] = useState(false);
  const [alertVolume, setAlertVolume] = useState([75]);
  const [enableSoundAlerts, setEnableSoundAlerts] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [alertDuration, setAlertDuration] = useState([5]);

  // Show only recent donations (last 5 minutes)
  const recentDonations = donations.filter(
    donation => Date.now() - donation.timestamp.getTime() < 5 * 60 * 1000
  );

  return (
    <>
      {/* Donation Alerts Overlay */}
      <AnimatePresence>
        {recentDonations.map((donation) => (
          <motion.div
            key={donation.id}
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
          >
            <Card className="bg-gradient-to-r from-yellow-500/90 to-orange-500/90 border-yellow-300 shadow-xl backdrop-blur-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-white">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-bold text-lg">
                        {donation.currency}{donation.amount}
                      </span>
                      <span className="text-white/80">from</span>
                      <span className="font-semibold">{donation.donorName}</span>
                    </div>
                    {donation.message && (
                      <p className="text-sm text-white/90 mt-1">
                        "{donation.message}"
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 pointer-events-auto"
                    onClick={() => onDismissAlert(donation.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 right-4 z-40 bg-black/50 text-white hover:bg-black/70"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Stream Settings
            </DialogTitle>
            <DialogDescription>
              Configure your streaming experience and alert preferences.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Alert Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Alert Settings</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-normal">Sound Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Play sounds for donations and follows
                  </p>
                </div>
                <Switch
                  checked={enableSoundAlerts}
                  onCheckedChange={setEnableSoundAlerts}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-normal">Animations</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable alert animations and effects
                  </p>
                </div>
                <Switch
                  checked={enableAnimations}
                  onCheckedChange={setEnableAnimations}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Alert Volume</Label>
                <Slider
                  value={alertVolume}
                  onValueChange={setAlertVolume}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>{alertVolume[0]}%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Alert Duration (seconds)</Label>
                <Slider
                  value={alertDuration}
                  onValueChange={setAlertDuration}
                  max={15}
                  min={3}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3s</span>
                  <span>{alertDuration[0]}s</span>
                  <span>15s</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Stream Quality Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Stream Quality</h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Resolution</Label>
                  <p>1080p60</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Bitrate</Label>
                  <p>4,500 kbps</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Latency</Label>
                  <p className="text-green-600">2.3s</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Dropped Frames</Label>
                  <p>0</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Donations Sheet */}
      <Sheet open={showDonations} onOpenChange={setShowDonations}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-16 right-4 z-40 bg-black/50 text-white hover:bg-black/70"
          >
            <Gift className="h-5 w-5" />
            {recentDonations.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {recentDonations.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Recent Donations
            </SheetTitle>
            <SheetDescription>
              Latest donations and support from your viewers.
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-120px)] mt-6">
            <div className="space-y-4">
              {donations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No donations yet</p>
                  <p className="text-sm">Your supporters will appear here</p>
                </div>
              ) : (
                donations.map((donation) => (
                  <Card key={donation.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                          {donation.donorName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {donation.donorName}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {donation.currency}{donation.amount}
                          </Badge>
                        </div>
                        {donation.message && (
                          <p className="text-xs text-muted-foreground">
                            "{donation.message}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {donation.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs font-medium">
                            Supporter
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
        {isLive && (
          <Badge variant="destructive" className="animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
        )}
      </div>
    </>
  );
}

export default StreamingOverlays;
