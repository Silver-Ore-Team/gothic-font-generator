import './App.css';
import { useSelector, useDispatch } from 'react-redux'
import { State } from './app/store';
import { settingsActions } from './app/reducers/settings';
import { localFontService } from './service/local-font.service';
import Settings from './components/Settings';
import FontPreview from './components/FontPreview';
import FontCanvas from './components/FontCanvas';
import { Col, Container, Row } from 'react-bootstrap';

function App() {
  const font = useSelector<State, string>(state => state.settings.font);
  const dispatch = useDispatch();

  const queryFonts = async () => {
      const fonts = await localFontService.queryLocalFonts();
      console.log(fonts);
  };

  return (
    <div className="App pb-4">
      <Container fluid>
        <Row>
          <h1 className="h3 pt-2 pb-0 mb-0">Gothic Font Generator</h1>
          <p style={{fontSize: '0.9rem'}}>Created by Silver Ore Team</p>
          <hr className="mb-2"/>
        </Row>
        <Row className="pt-2">
          <Col sm="3">
            <Settings />
          </Col>
          <Col>
            <FontCanvas />
            <FontPreview />
          </Col>
        </Row>
      </Container>
      <a id="download" style={{visibility: 'hidden'}}></a>
    </div>
  );
}

export default App;
