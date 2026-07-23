import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eraser, Trash2, Save, Pen, Minus, Plus } from "lucide-react";

interface SenseBoardProps {
  onSave: (dataUrl: string) => void;
  saving?: boolean;
}

export default function SenseBoard({ onSave, saving }: SenseBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getCtx = () => canvasRef.current?.getContext("2d");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(2, 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    }
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0]?.clientX ?? e.changedTouches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0]?.clientY ?? e.changedTouches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx) return;
    setIsDrawing(true);
    setHasDrawn(true);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = tool === "eraser" ? strokeWidth * 5 : strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : "#1a1a2e";
  }, [tool, strokeWidth]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing]);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    getCtx()?.closePath();
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    setHasDrawn(false);
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <Card className="border-border">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-foreground mr-2">SenseBoard</span>
            <Button type="button" variant={tool === "pen" ? "default" : "outline"} size="sm" onClick={() => setTool("pen")}>
              <Pen className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant={tool === "eraser" ? "default" : "outline"} size="sm" onClick={() => setTool("eraser")}>
              <Eraser className="h-3.5 w-3.5" />
            </Button>
            <div className="flex items-center gap-1 ml-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setStrokeWidth(Math.max(1, strokeWidth - 1))} className="h-7 w-7 p-0">
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground w-4 text-center">{strokeWidth}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setStrokeWidth(Math.min(10, strokeWidth + 1))} className="h-7 w-7 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button type="button" variant="outline" size="sm" onClick={clearCanvas}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
            <Button type="button" size="sm" onClick={handleSave} disabled={!hasDrawn || saving} className="gradient-primary text-primary-foreground">
              <Save className="h-3.5 w-3.5 mr-1" /> {saving ? "Saving..." : "Save Drawing"}
            </Button>
          </div>
        </div>
        <div className="border border-border rounded-md overflow-hidden bg-white" style={{ touchAction: "none" }}>
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair"
            style={{ height: "200px" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">Draw using mouse or stylus • Optional handwritten notes</p>
      </CardContent>
    </Card>
  );
}
