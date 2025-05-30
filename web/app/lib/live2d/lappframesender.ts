import { LAppPal } from './lapppal';
import { canvas, gl, frameBuffer } from './lappdelegate';


export class LAppFrameSender {
    private ws: WebSocket | null = null;
    private isSending = false;

    public initialize(): void {
        this.ws = new WebSocket('ws://localhost:8080');
        this.setupWebSocket();
    }
    private setupWebSocket() {
        if (this.ws) {
            this.ws.onopen = () => {
                this.isSending = true;
            };
            this.ws.onclose = () => {
                this.isSending = false;
            }
        }
    }
    sendFrame() {
        if (!this.isSending) {
            return;
        }
        this.sendFrameData();
    }
    sendFrameData() {
        if (this.isSending && this.ws && this.ws.readyState === WebSocket.OPEN && gl && canvas) {
            gl.finish();


            const width = canvas.width;
            const height = canvas.height;
            const rawBuffer = new Uint8Array(width * height * 4);
            gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, rawBuffer);

            const header = new Uint32Array([width,height]);
            const packet = new Uint8Array(8 + rawBuffer.length);
            packet.set(new Uint8Array(header.buffer), 0);
            packet.set(rawBuffer, 8);
            this.ws.send(packet.buffer);
        }
    }
    destroy() {
        this.isSending = false;
        if (this.ws) {
            this.ws.close();
        }
    }
}