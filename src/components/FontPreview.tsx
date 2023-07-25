import { useSelector } from 'react-redux'
import { State } from '../app/store';
import { SettingsState } from '../app/reducers/settings';

function FontPreview() {
    const settings = useSelector<State, SettingsState>(state => state.settings);

    return <div>
        <h2 className="h4">Font Preview</h2>
        <div style={{ fontFamily: settings.font, fontStyle: settings.fontStyle, fontSize: '22px' }}>
            A quick brown fox jumps over the lazy dog;<br />
            Zażółć gęślą jaźń; <br />
            Falsches Üben von Xylophonmusik quält jeden größeren Zwerg;<br />
            Эх, чужак, общий съём цен шляп (юфть) – вдрызг!
        </div>
    </div>
};

export default FontPreview;