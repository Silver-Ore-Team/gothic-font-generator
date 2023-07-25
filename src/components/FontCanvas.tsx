import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import './FontCanvas.css';
import { State } from '../app/store';
import { SettingsState } from '../app/reducers/settings';
import { Button, ButtonGroup, ButtonToolbar, Spinner } from 'react-bootstrap';
import { fontRendererService } from '../service/font-renderer.service';
import { ChannelOrder, Color, decodeImage, decodePng, encodeTga } from 'image-in-browser';

function FontCanvas() {
    const settings = useSelector<State, SettingsState>(state => state.settings);
    const outputSize = useSelector<State, number>(state => state.settings.outputSize);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const debugCanvasRef = useRef<HTMLCanvasElement>(null);
    const [containerHeight, setContainerHeight] = useState('auto');
    const [processing, setProcessning] = useState(false);
    const [tgaProcessing, setTgaProcessning] = useState(false);
    const [fntProcessing, setFntProcessning] = useState(false);

    const onContainerResize = (element: HTMLDivElement) => {
        const width = element.clientWidth;
        const height = `${width / 2}px`;
        console.log(width);
        if (containerHeight !== height) {
            setContainerHeight(`${width / 2}px`);
        }
    };

    const onDrawClick = () => {
        const canvas = canvasRef.current;
        const debugCanvas = debugCanvasRef.current;
        if (canvas && debugCanvas) {
            fontRendererService.render(canvas, debugCanvas, settings, {
                debugUV: settings.showDebugUV
            });
        }
    };

    const onDownloadTga = async (): Promise<void> => {
        const canvas = canvasRef.current;
        if (canvas) {
            setTgaProcessning(true);
            return new Promise((resolve, error) => {
                canvas.toBlob(blob => {
                    if (blob) {
                        blob.arrayBuffer().then(buf => {
                            const bytes = new Uint8Array(buf);
                            const image = decodePng({ data: bytes });
                            if (!image) {
                                console.error('Could not decode image');
                                setTgaProcessning(false);
                                error('Could not decode image');
                                return;
                            }
                            image.remapChannels(ChannelOrder.bgra);
                            const tgaImage = image.convert({
                                numChannels: 4,
                                alpha: 1,
                                withPalette: false
                            });
                            for (let y = 0; y < tgaImage.height; y++) {
                                for (let x = 0; x < tgaImage.width; x++) {
                                    const rgbaColor = tgaImage.getPixelLinear(x, y);
                                    tgaImage.setPixelRgba(x, y, rgbaColor.b, rgbaColor.g, rgbaColor.r, rgbaColor.a);
                                }
                            }
                            const tgaBytes = encodeTga({ 
                                image: tgaImage
                            });
                            tgaBytes.set([8], 0x11); // Set alphaBits = 8
                            const tgaBase64 = btoa(tgaBytes.reduce((data, byte) => data + String.fromCharCode(byte), ''));
                            const dataUrl = `data:image/tga;base64,${tgaBase64}`;
                            const link = document.getElementById('download') as HTMLLinkElement;
                            link.setAttribute('download', `${settings.outputName}.TGA`);
                            link.setAttribute('href', dataUrl.replace("image/tga", "image/octet-stream"));
                            link.click();
                            link.setAttribute('download', `${settings.outputName}_HI.TGA`);
                            link.setAttribute('href', dataUrl.replace("image/tga", "image/octet-stream"));
                            link.click();
                            setTgaProcessning(false);
                            resolve();
                        });
                    } else {
                        setTgaProcessning(false);
                    }
                }, "image/png");
            });
        }
        return new Promise((resolve) => { resolve(); });
    };

    const onDownloadFnt = () => {
        setFntProcessning(true);
        const data = fontRendererService.getFontData();
        if (!data) {
            setFntProcessning(false);
            return;
        }
        const base64 = btoa(data.reduce((d, byte) => d + String.fromCharCode(byte), ''));
        const dataUrl = `data:application/octet-stream;base64,${base64}`;
        const link = document.getElementById('download') as HTMLLinkElement;
        link.setAttribute('download', `${settings.outputName}.FNT`);
        link.setAttribute('href', dataUrl);
        link.click();
        link.setAttribute('download', `${settings.outputName}_HI.FNT`);
        link.setAttribute('href', dataUrl);
        link.click();
        setFntProcessning(false);
    };

    const onDownloadAll = async () => {
        setProcessning(true);
        await onDownloadTga();
        onDownloadFnt();
        setProcessning(false);
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const debugCanvas = debugCanvasRef.current;
        if (canvas) {
            canvas.width = 512 * outputSize / 10;
            canvas.height = 256 * outputSize / 10;
        }
        if (debugCanvas) {
            debugCanvas.width = 512 * outputSize / 10;
            debugCanvas.height = 256 * outputSize / 10;
        }
    }, [canvasRef, outputSize]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            onContainerResize(container);
        }
    }, [containerRef]);

    useEffect(() => {
        onDrawClick();
    }, [settings]);

    return <div className="FontCanvas">
        <h2 className="h4 pb-2">Font Canvas</h2>

        <ButtonToolbar className="mb-2">
            <ButtonGroup className="me-2">
                <Button size="sm" onClick={() => onDrawClick()}>
                    Draw
                </Button>
            </ButtonGroup>
            <ButtonGroup className="me-2">
                <Button variant="success" size="sm" onClick={() => onDownloadAll()} disabled={processing || tgaProcessing || fntProcessing}>
                    {tgaProcessing && <Spinner as="span" animation="border" size="sm" className="me-2" />}
                    Download (TGA + FNT)
                </Button>
            </ButtonGroup>
            <ButtonGroup className="me-2">
                <Button variant="secondary" size="sm" onClick={() => onDownloadTga()} disabled={tgaProcessing}>
                    {tgaProcessing && <Spinner as="span" animation="border" size="sm" className="me-2" />}
                    Download TGA
                </Button>
            </ButtonGroup>
            <ButtonGroup className="me-2">
                <Button variant="secondary" size="sm" onClick={() => onDownloadFnt()} disabled={fntProcessing}>
                    {fntProcessing && <Spinner as="span" animation="border" size="sm" className="me-2" />}
                    Download FNT
                </Button>
            </ButtonGroup>
        </ButtonToolbar>
        <div className="FontCanvas-container" 
             style={{height: containerHeight, minHeight: '1px', maxWidth: '1024px', background: settings.previewBackground}}
             ref={containerRef}
             onLoad={e => onContainerResize(e.target as HTMLDivElement)}
             onResize={e => onContainerResize(e.target as HTMLDivElement)}
        >
            {settings.showReference && <img className="FontCanvas-reference" 
                src={`/examples/${settings.outputSize == 20 ? 'Font_20_Book_Hi.png' : 'Font_10_Book_Hi.png'}`}
                style={{height: containerHeight, maxWidth: '1024px'}} />}
            <canvas ref={debugCanvasRef} style={{height: containerHeight, maxWidth: '1024px'}}></canvas>
            <canvas ref={canvasRef} style={{height: containerHeight, maxWidth: '1024px'}}></canvas>
            <div>&nbsp;</div>
        </div>
    </div>
};

export default FontCanvas;