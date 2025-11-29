import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Trash2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WaveSurfer from 'wavesurfer.js';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const timerRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (wavesurferRef.current) wavesurferRef.current.destroy();
      if (audioBlob) URL.revokeObjectURL(URL.createObjectURL(audioBlob));
    };
  }, []);

  useEffect(() => {
    if (audioBlob && waveformRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgba(100, 100, 100, 0.5)',
        progressColor: 'hsl(var(--primary))',
        cursorColor: 'transparent',
        barWidth: 2,
        barGap: 3,
        height: 30,
        normalize: true,
      });

      const audioUrl = URL.createObjectURL(audioBlob);
      wavesurferRef.current.load(audioUrl);

      wavesurferRef.current.on('finish', () => {
        wavesurferRef.current?.stop();
      });

      return () => {
        wavesurferRef.current?.destroy();
        URL.revokeObjectURL(audioUrl);
      };
    }
  }, [audioBlob]);

  const startRecording = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsLocked(false);
      setRecordingTime(0);
      setAudioBlob(null);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      startYRef.current = clientY;

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setIsLocked(false);
    setRecordingTime(0);
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob);
      setAudioBlob(null);
      setIsLocked(false);
      setRecordingTime(0);
    }
  };

  const handleRelease = () => {
    if (isRecording && !isLocked) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        
        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            onSend(blob);
            setIsRecording(false);
            setRecordingTime(0);
            if (timerRef.current) clearInterval(timerRef.current);
        };
      }
    }
    startYRef.current = null;
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRecording && !isLocked && startYRef.current !== null) {
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      const diff = startYRef.current - clientY;
      
      if (diff > 50) {
        setIsLocked(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePreview = () => {
    wavesurferRef.current?.playPause();
  };

  return (
    <div className="flex items-center gap-2 relative">
      {isRecording && (
        <div className="absolute bottom-full right-0 left-0 mb-2 bg-background/90 backdrop-blur-md rounded-lg flex items-center px-4 py-2 gap-4 border z-20">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
           <span className="text-xs text-foreground">{formatTime(recordingTime)}</span>
           
           <div className="flex-1 flex items-center gap-[2px] h-4 overflow-hidden">
              {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-1 bg-primary animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
              ))}
           </div>

           {isLocked ? (
             <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={cancelRecording} className="h-8 w-8">
                    <Trash2 size={18} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => { stopRecording(); }} className="h-8 w-8">
                    <Square size={18} fill="currentColor" />
                </Button>
             </div>
           ) : (
             <div className="flex items-center gap-2 text-muted-foreground text-[10px] animate-bounce">
                <Lock size={12} />
                <span>ВВЕРХ</span>
             </div>
           )}
        </div>
      )}

      {!isRecording && audioBlob && (
        <div className="flex items-center gap-2 bg-muted p-2 rounded-lg">
          <Button size="icon" variant="ghost" onClick={togglePreview} className="h-8 w-8">
             <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-current border-b-[6px] border-b-transparent ml-1" />
          </Button>
          <div
            ref={waveformRef}
            className="w-32 cursor-pointer"
            onClick={togglePreview}
          />
          <span className="text-[10px] text-muted-foreground">
             {formatTime(recordingTime)}
          </span>
          <Button size="icon" variant="ghost" onClick={handleSend} className="h-8 w-8">
            <Send size={16} />
          </Button>
          <Button
            size="icon" variant="ghost"
            onClick={() => { setAudioBlob(null); setRecordingTime(0); }}
            className="h-8 w-8"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )}

      {!audioBlob && (
        <Button
          size="icon"
          variant="ghost"
          onMouseDown={startRecording}
          onMouseUp={handleRelease}
          onMouseMove={handleMove}
          onTouchStart={startRecording}
          onTouchEnd={handleRelease}
          onTouchMove={handleMove}
          onMouseLeave={handleRelease}
          className={`transition-all duration-200 ${
            isRecording 
              ? 'text-primary scale-110' 
              : ''
          }`}
        >
          <Mic size={20} className={isRecording ? 'animate-pulse' : ''} />
        </Button>
      )}
    </div>
  );
};
