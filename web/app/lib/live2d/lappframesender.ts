import { LAppPal } from './lapppal';
import { canvas, gl, frameBuffer } from './lappdelegate';
import grandiose from 'grandiose';

export class LAppFrameSender {
    private isSending = false;
    private sender : grandiose.Sender | null = null;

    public initialize(): void {
        this.sender = grandiose.send({
            name: 'awesome-digital-human-live2d',
            groups: null,
            clockVideo: true,
            clockAudio: false,
        })
    }
    
    sendFrame() {
        if (!this.isSending) {
            return;
        }
        this.sendFrameData();
    }
    sendFrameData() {
        if (this.isSending && gl && canvas) {
            gl.finish();


            const width = canvas.width;
            const height = canvas.height;
            const rawBuffer = new Uint8Array(width * height * 4);
            gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, rawBuffer);

            const header = new Uint32Array([width,height]);
            const packet = new Uint8Array(8 + rawBuffer.length);
            packet.set(new Uint8Array(header.buffer), 0);
            packet.set(rawBuffer, 8);

            this.sender?.video({
                type: 'video',
                xres: width,
                yres: height,
                frameRateN: 60,
                frameRateD: 1,
                fourCC: 1095911234, // BGRA
                pictureAspectRatio: width / height,
                timestamp: [0, 0],
                frameFormatType: 1, // 使用 FrameType 枚举
                timecode: [0, 0],
                lineStrideBytes: width * 4,
                data: packet.buffer,
            })
        }
    }
    destroy() {
        this.isSending = false;
    }
}