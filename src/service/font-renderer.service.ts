import { SettingsState } from "../app/reducers/settings";

interface FntData {
    name: string;
    height: number;
    letters: number;
    width: number[];
    uv1: number[][];
    uv2: number[][];
}

export interface RenderOptions {
    debugUV?: boolean
}

class FontRendererService {
    private _fontData?: FntData;

    public render(canvas: HTMLCanvasElement, debugCanvas: HTMLCanvasElement, settings: SettingsState, options?: RenderOptions): void {
        const alphabet = this.generateUnicodeAlphabet(settings.codepage);

        const size = this.outputSizeDimensions(settings.outputSize);
        canvas.width = size.x;
        canvas.height = size.y;
        debugCanvas.width = size.x;
        debugCanvas.height = size.y;

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const debugCtx = debugCanvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, size.x, size.y);
        debugCtx.clearRect(0, 0, size.x, size.y);

        ctx.font = `${settings.fontStyle} ${settings.fontSize} ${settings.font}`;
        ctx.fillStyle = settings.color;
        ctx.fillStyle = settings.color;

        const sizeX = (canvas.width) / 28;
        const sizeY = (canvas.height) / 12;

        this._fontData = {
            name: settings.outputName.toUpperCase() + '.TGA',
            height: sizeY,
            letters: 256,
            width: Array(256).fill(0, 0, 256),
            uv1: Array(256).fill([0, 0], 0, 256),
            uv2: Array(256).fill([1, 1], 0, 256)
        };

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 28; x++) {
                const index = y * 28 + x;
                const character = alphabet.charAt(index);
                const offsetX = x * sizeX;
                const offsetY = y * sizeY;
                
                const metrics = ctx.measureText(character);
                const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
                const paddingX = Math.max((sizeX - metrics.width) / 2, 2);
                const paddingY = Math.max((sizeY - fontHeight) / 2, 2);
                const positionX = offsetX + paddingX;
                const positionY = offsetY - paddingY + fontHeight;

                const uvAdjustLeft = parseInt(settings.uvAdjustLeft) || 0;
                const uvAdjustRight = parseInt(settings.uvAdjustRight) || 0;
                const uvAdjustTop = parseInt(settings.uvAdjustTop) || 0;
                const uvAdjustBottom = parseInt(settings.uvAdjustBottom) || 0;

                this._fontData.width[32 + index] = metrics.width;
                this._fontData.uv1[32 + index] = [(positionX - uvAdjustLeft) / canvas.width, (offsetY - uvAdjustTop) / canvas.height];
                this._fontData.uv2[32 + index] = [(positionX + metrics.width + uvAdjustRight + uvAdjustLeft) / canvas.width, (offsetY + fontHeight + uvAdjustBottom + uvAdjustTop) / canvas.height];

                if (options?.debugUV) {
                    debugCtx.fillStyle = '#0000ff';
                    debugCtx.lineWidth = 2;
                    debugCtx.strokeStyle = '#ff0000';
                    debugCtx.globalAlpha = 0.25;
                    debugCtx.strokeRect(positionX - uvAdjustLeft, offsetY - uvAdjustTop, metrics.width + uvAdjustRight + uvAdjustLeft, fontHeight + uvAdjustBottom + uvAdjustTop);
                    debugCtx.fillRect(positionX - uvAdjustLeft, offsetY - uvAdjustTop, metrics.width + uvAdjustRight + uvAdjustLeft, fontHeight + uvAdjustBottom + uvAdjustTop);
                }

                if (settings.outline) {
                    const size = parseInt(settings.outlineSize) || 0;
                    ctx.lineWidth = size;
                    ctx.strokeStyle = settings.outlineColor;
                    ctx.strokeText(character, positionX, positionY, sizeX);
                }

                ctx.fillText(character, positionX, positionY, sizeX);
            }
        }
    }

    public getFontData(): Uint8Array {
        if (!this._fontData) {
            return new Uint8Array([]);
        }

        const bytes: number[] = [];

        // Version
        bytes.push(0x31); // 1
        bytes.push(0x0A);
        
        // Name
        for (let i = 0; i < this._fontData.name.length; i++) {
            const val = this._fontData.name.charCodeAt(i);
            bytes.push(Math.min(val, 255));
        }
        bytes.push(0x0A);

        // Height
        console.log(this._fontData.height);
        this.writeInt32(this._fontData.height, bytes);

        // Letters
        this.writeInt32(this._fontData.letters, bytes);

        // Width array
        for (let i = 0; i < this._fontData.width.length; i++) {
            this.writeInt8(this._fontData.width[i], bytes);
        }

        // UV1
        for (let i = 0; i < this._fontData.uv1.length; i++) {
            this.writeFloat32Array([this._fontData.uv1[i][0], this._fontData.uv1[i][1]], bytes);
        }

        // UV2
        for (let i = 0; i < this._fontData.uv2.length; i++) {
            this.writeFloat32Array([this._fontData.uv2[i][0], this._fontData.uv2[i][1]], bytes);
        }

        return new Uint8Array(bytes);
    }

    private outputSizeDimensions(outputSize: number): {x: number, y: number} {
        if (!outputSize) {
            return {x: 512, y: 256};
        }
        return {x: 512 * outputSize / 10, y: 256 * outputSize / 10};
    }

    private generateUnicodeAlphabet(codepage: string): string {
        const decoder = new TextDecoder(codepage);
        const codepageArray = [];
        for (let i = 32; i < 256; i++) {
            codepageArray.push(i);
        }
        return decoder.decode(new Uint8Array(codepageArray));
    }

    private writeInt8(value: number, buffer: number[]) {
        const arr = new ArrayBuffer(1);
        const view = new DataView(arr);
        view.setUint8(0, value);
        buffer.push(view.getUint8(0));
    }

    private writeInt32(value: number, buffer: number[]) {
        const arr = new ArrayBuffer(4);
        const view = new DataView(arr);
        view.setUint32(0, value, true);
        buffer.push(view.getUint8(0));
        buffer.push(view.getUint8(1));
        buffer.push(view.getUint8(2));
        buffer.push(view.getUint8(3));
    }

    private writeFloat32Array(value: number[], buffer: number[]) {
        const float = new Float32Array(value.length);
        for (let i = 0; i < value.length; i++) {
            float[i] = value[i];
        }
        const view = new DataView(float.buffer);
        for (let i = 0; i < view.byteLength; i++) {
            buffer.push(view.getUint8(i));
        }
    }
}

export const fontRendererService = new FontRendererService();