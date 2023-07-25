import { createSlice } from '@reduxjs/toolkit'

export interface SettingsState {
    codepage: string;
    font: string;
    fontStyle: string;
    fontSize: string;
    fontWeight: string;
    color: string;
    colorHi: string;
    outline: boolean;
    outlineSize: string;
    outlineColor: string;
    outlineColorHi: string;
    outputName: string;
    outputSize: number;
    uvAdjustLeft: string;
    uvAdjustRight: string;
    uvAdjustTop: string;
    uvAdjustBottom: string;
    previewBackground: string;
    showReference: boolean;
    showDebugUV: boolean;
};

export const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        codepage: 'windows-1250',
        font: 'Arial',
        fontStyle: 'normal',
        fontSize: '30px',
        fontWeight: 'normal',
        color: '#000000',
        colorHi: '#000000',
        outline: false,
        outlineSize: '2',
        outlineColor: '#000000',
        outlineColorHi: '#000000',
        outputName: 'My_Font',
        outputSize: 20,
        uvAdjustLeft: '0',
        uvAdjustRight: '0',
        uvAdjustTop: '0',
        uvAdjustBottom: '0',
        previewBackground: '#cccccc',
        showReference: true,
        showDebugUV: true
    },
    reducers: {
        setCodepage: (state, action) => {
            state.codepage = action.payload;
        },
        setFont: (state, action) => {
            state.font = action.payload;
        },
        setFontStyle: (state, action) => {
            state.fontStyle = action.payload;
        },
        setFontSize: (state, action) => {
            state.fontSize = action.payload;
        },
        setFontWeight: (state, action) => {
            state.fontWeight = action.payload;
        },
        setColor: (state, action) => {
            state.color = action.payload;
        },
        setColorHi: (state, action) => {
            state.colorHi = action.payload;
        },
        setOutline: (state, action) => {
            state.outline = action.payload;
        },
        setOutlineSize: (state, action) => {
            state.outlineSize = action.payload;
        },
        setOutlineColor: (state, action) => {
            state.outlineColor = action.payload;
        },
        setOutlineColorHi: (state, action) => {
            state.outlineColorHi = action.payload;
        },
        setOutputName: (state, action) => {
            state.outputName = action.payload;
        },
        setOutputSize: (state, action) => {
            state.outputSize = action.payload;
        },
        setUVAdjustLeft: (state, action) => {
            state.uvAdjustLeft = action.payload;
        },
        setUVAdjustRight: (state, action) => {
            state.uvAdjustRight = action.payload;
        },
        setUVAdjustTop: (state, action) => {
            state.uvAdjustTop = action.payload;
        },
        setUVAdjustBottom: (state, action) => {
            state.uvAdjustBottom = action.payload;
        },
        setPreviewBackground: (state, action) => {
            state.previewBackground = action.payload;
        },
        setShowReference: (state, action) => {
            state.showReference = action.payload;
        },
        setShowDebugUV: (state, action) => {
            state.showDebugUV = action.payload;
        },
    }
});

export const settingsActions = settingsSlice.actions;

export default settingsSlice.reducer;