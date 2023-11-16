import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { LocalFont, localFontService } from "../service/local-font.service";
import { Accordion, Button, ButtonGroup, ButtonToolbar, Form } from "react-bootstrap";
import { State } from "../app/store";
import { SettingsState, settingsActions } from "../app/reducers/settings";

function Settings() {
    const settings = useSelector<State, SettingsState>(state => state.settings);
    const dispatch = useDispatch();

    const [localFontsMessage, setLocalFontsMessage] = useState('');
    const [localFonts, setLocalFonts] = useState<LocalFont[]>([]);

    useEffect(() => {
        if (!localFontService.queryLocalFontsAvailable) {
            setLocalFontsMessage('window.queryLocalFonts not available in your browser');
        }
    });
    
    const queryFonts = async () => {
        if (!localFontService.queryLocalFontsAvailable) {
            return;
        }

        setLocalFontsMessage('Loading local fonts...');
        try {
            const fonts = await localFontService.queryLocalFonts();
            setLocalFonts(fonts);
            const stylesLength = fonts.reduce((acc, val) => acc + val.styles.length, 0);
            setLocalFontsMessage(`Loaded ${fonts.length} local fonts (${stylesLength} distinct styles)`);
        } catch (error) {
            setLocalFontsMessage(`Error: ${error}`);
        }
    };

    const onResetSettings = () => {
        localStorage.removeItem('state');
        window.location.reload();
    };

    return <div className="Settings">
        <Form>
            <h2 className="h4 pb-2">Settings</h2>

            <ButtonToolbar className="mb-2">
                <ButtonGroup className="me-2">
                    <Button variant="danger" size="sm" onClick={() => onResetSettings()}>
                        Reset settings to defaults
                    </Button>
                </ButtonGroup>
            </ButtonToolbar>

            <Accordion defaultActiveKey={['instruction']} alwaysOpen>
                <Accordion.Item eventKey="instruction">
                    <Accordion.Header>Instruction</Accordion.Header>
                    <Accordion.Body>
                        <p style={{fontSize: '0.8rem'}}>
                            This tool let's you generate a bitmap font for Gothic games built on ZenGin.
                            You can select any font face on your system, configure it's size and color and preview your work.
                        </p>
                        <p style={{fontSize: '0.8rem'}}>
                            When you are happy with the result, click "Download" to generate a texture and FNT file with UV mapping.
                            Place generated files in:
                        </p>
                        <ul style={{fontSize: '0.8rem'}}>
                            <li>TGA - _work/Data/Textures/Fonts/nomip/</li>
                            <li>FNT - _work/Data/Textures/_compiled/</li>
                        </ul>
                        <p style={{fontSize: '0.8rem'}}>
                            UV mapping is essential for proper text composing, so you can adjust the bounding boxes in "UV Adjust" tab. 
                            Font should have some padding on top and/or bottom to render nicely in multi-line texts.
                        </p>
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="font">
                    <Accordion.Header>Font</Accordion.Header>
                    <Accordion.Body>
                        <Form.Group className="mt-2">
                            <Button variant="secondary" disabled={!localFontService.queryLocalFontsAvailable} 
                                    onClick={() => queryFonts()}
                                    size="sm">
                                Query Local Fonts (needs permission)
                            </Button>  
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Text>
                                {localFontsMessage}
                            </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-2">
                            <Form.Label>Code Page</Form.Label>
                            <Form.Select value={settings.codepage} onChange={e => dispatch(settingsActions.setCodepage(e.target.value))}>
                                <option value="windows-1250">CP 1250 (Czech, Polish, Hungarian, Romanian)</option>
                                <option value="windows-1251">CP 1251 (Russian, Ukrainian)</option>
                                <option value="windows-1252">CP 1252 (German, English, French, Italian, Spanish)</option>
                                <option value="windows-1254">CP 1254 (Turkish)</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Font Family</Form.Label>
                            <Form.Control 
                                type="text" 
                                list="fonts" 
                                value={settings.font} 
                                onChange={e => dispatch(settingsActions.setFont(e.target.value))} 
                            />
                            <datalist id="fonts">
                                {localFonts.map(localFont => <option key={localFont.family} value={localFont.family} />)}
                            </datalist>
                        </Form.Group>
                        
                        <Form.Group className="mb-2">
                            <Form.Label>Font Style</Form.Label>
                            <Form.Select value={settings.fontStyle} onChange={e => dispatch(settingsActions.setFontStyle(e.target.value))}>
                                <option value="normal">Normal</option>
                                <option value="italic">Italic</option>
                            </Form.Select>
                        </Form.Group>
                        
                        <Form.Group className="mb-2">
                            <Form.Label>Font Size</Form.Label>
                            <Form.Control
                                type="text"
                                value={settings.fontSize} 
                                onChange={e => dispatch(settingsActions.setFontSize(e.target.value))} 
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Color</Form.Label>
                            <Form.Control
                                type="text"
                                value={settings.color} 
                                onChange={e => dispatch(settingsActions.setColor(e.target.value))} 
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Color (HI)</Form.Label>
                            <Form.Control
                                type="text"
                                value={settings.colorHi} 
                                onChange={e => dispatch(settingsActions.setColorHi(e.target.value))} 
                            />
                        </Form.Group>
                    </Accordion.Body>
                </Accordion.Item>


                <Accordion.Item eventKey="outline">
                    <Accordion.Header>Text Outline</Accordion.Header>
                    <Accordion.Body>
                        <Form.Group className="mb-2">
                            <Form.Check 
                                type="checkbox"
                                label="Draw Text Outline"
                                checked={settings.outline}
                                onChange={e => dispatch(settingsActions.setOutline(e.target.checked))}
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Size</Form.Label>
                            <Form.Control
                                type="text"
                                value={settings.outlineSize} 
                                onChange={e => dispatch(settingsActions.setOutlineSize(e.target.value))} 
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Color</Form.Label>
                            <Form.Control
                                type="text"
                                value={settings.outlineColor} 
                                onChange={e => dispatch(settingsActions.setOutlineColor(e.target.value))} 
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>Color (HI)</Form.Label>
                            <Form.Control
                                type="text"
                                value={settings.outlineColorHi} 
                                onChange={e => dispatch(settingsActions.setOutlineColorHi(e.target.value))} 
                            />
                        </Form.Group>
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="output">
                    <Accordion.Header>Output</Accordion.Header>
                    <Accordion.Body>
                        <Form.Group className="mb-2">
                            <Form.Label>Output Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={settings.outputName} 
                                onChange={e => dispatch(settingsActions.setOutputName(e.target.value))} 
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-2">
                            <Form.Label>Output Size</Form.Label>
                            <Form.Select value={settings.outputSize} onChange={e => dispatch(settingsActions.setOutputSize(parseInt(e.target.value)))}>
                                <option value="10">10 (512 x 256)</option>
                                <option value="20">20 (1024 x 512)</option>
                            </Form.Select>
                        </Form.Group>
                    </Accordion.Body>
                </Accordion.Item>
                

                <Accordion.Item eventKey="uv-adjust">
                    <Accordion.Header>UV Adjust</Accordion.Header>
                    <Accordion.Body>
                        <Form.Group className="mb-2">
                            <Form.Label>Left</Form.Label>
                            <Form.Control
                                type="text"
                                value={settings.uvAdjustLeft} 
                                onChange={e => dispatch(settingsActions.setUVAdjustLeft(e.target.value))} 
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Right</Form.Label>
                            <Form.Control
                                type="text"
                                value={settings.uvAdjustRight} 
                                onChange={e => dispatch(settingsActions.setUVAdjustRight(e.target.value))} 
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Top</Form.Label>
                            <Form.Control
                                type="text"
                                value={settings.uvAdjustTop} 
                                onChange={e => dispatch(settingsActions.setUVAdjustTop(e.target.value))} 
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Bottom</Form.Label>
                            <Form.Control
                                type="text"
                                value={settings.uvAdjustBottom} 
                                onChange={e => dispatch(settingsActions.setUVAdjustBottom(e.target.value))} 
                            />
                        </Form.Group>
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="preview">
                    <Accordion.Header>Preview / Debug</Accordion.Header>
                    <Accordion.Body>
                        <Form.Group className="mb-2">
                            <Form.Label>Preview Background</Form.Label>
                            <Form.Control
                                type="text"
                                value={settings.previewBackground} 
                                onChange={e => dispatch(settingsActions.setPreviewBackground(e.target.value))} 
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Check 
                                type="checkbox"
                                label="Show reference font"
                                checked={settings.showReference}
                                onChange={e => dispatch(settingsActions.setShowReference(e.target.checked))}
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Check 
                                type="checkbox"
                                label="Show debug UV bounding boxes"
                                checked={settings.showDebugUV}
                                onChange={e => dispatch(settingsActions.setShowDebugUV(e.target.checked))}
                            />
                        </Form.Group>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </Form>
    </div>
}

export default Settings;