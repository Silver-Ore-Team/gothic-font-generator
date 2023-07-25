export interface LocalFont {
    family: string;
    styles: string[];
}

interface FontData {
    family: string;
    style: string;
}

class LocalFontService {
    private _fonts: LocalFont[] = [];

    public async queryLocalFonts(): Promise<LocalFont[]> {
        if (!this.queryLocalFontsAvailable) {
            console.error('window.queryLocalFonts not available');
            return [];
        }

        const fontsData = await (window as any).queryLocalFonts() as FontData[];
        const fonts: {[key: string]: LocalFont} = {};
        fontsData.forEach(fontData => {
            if (!fonts[fontData.family]) {
                fonts[fontData.family] = { 
                    family: fontData.family,
                    styles: []
                };
            }
            fonts[fontData.family].styles.push(fontData.style);
        });

        return Object.values(fonts);
    }

    get queryLocalFontsAvailable(): boolean {
        return 'queryLocalFonts' in window;
    }
}

export const localFontService = new LocalFontService();