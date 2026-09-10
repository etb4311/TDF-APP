import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../utils/audioEngine';

interface VisualizerProps {
  isPlaying: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bufferLength = 64;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      const analyser = audioEngine.analyser;

      if (analyser && isPlaying) {
        bufferLength = analyser.frequencyBinCount;
        analyser.getByteFrequencyData(dataArray);
      } else {
        for (let i = 0; i < 48; i++) {
          dataArray[i] = Math.max(0, dataArray[i] * 0.9 - 1);
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 28;
      const barSpacing = 2;
      const totalSpacing = (barCount - 1) * barSpacing;
      const barWidth = Math.max(2, (canvas.width - totalSpacing) / barCount);

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * 2] || 0;
        const percent = val / 255;
        const barHeight = Math.max(2, percent * (canvas.height - 4));
        const x = i * (barWidth + barSpacing);
        const y = canvas.height - barHeight;

        const grad = ctx.createLinearGradient(0, y, 0, canvas.height);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(1, '#0284c7');

        ctx.fillStyle = isPlaying && percent > 0.05 ? grad : '#1e293b';
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
      <span className="text-[10px] font-mono text-slate-400">OUT</span>
      <canvas
        ref={canvasRef}
        width={140}
        height={22}
        className="w-[140px] h-[22px] block rounded-xs"
      />
    </div>
  );
};
