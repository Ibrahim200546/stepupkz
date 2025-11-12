import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Hook to manage user online presence status
 * Automatically updates presence when user is active
 * Sets offline when user closes/leaves the app
 */
export const usePresence = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const setOnline = async () => {
      try {
        await supabase
          .from('user_presence')
          .upsert({
            user_id: user.id,
            status: 'online',
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    const setOffline = async () => {
      try {
        await supabase
          .from('user_presence')
          .update({
            status: 'offline',
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error setting offline:', error);
      }
    };

    // Set online immediately
    setOnline();

    // Update presence every 30 seconds (heartbeat)
    const intervalId = setInterval(setOnline, 30000);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOffline();
      } else {
        setOnline();
      }
    };

    // Handle beforeunload (closing tab/window)
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline status on page unload
      navigator.sendBeacon(
        `${supabase.supabaseUrl}/rest/v1/user_presence?user_id=eq.${user.id}`,
        JSON.stringify({
          status: 'offline',
          last_seen: new Date().toISOString(),
        })
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setOffline();
    };
  }, [user]);
};
