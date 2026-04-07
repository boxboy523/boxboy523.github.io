import { Shader } from './shader';

export declare function resizeAspectRatio(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement): void;
export declare function setupText(canvas: HTMLCanvasElement, initialText: string, line?: number): HTMLElement;
export declare function updateText(overlay: HTMLElement, text: string): void;

export declare class Axes {
    constructor(gl: WebGL2RenderingContext, length?: number);
    gl: WebGL2RenderingContext;
    shader: Shader;
    draw(viewMatrix: Float32List, projMatrix: Float32List): void;
    delete(): void;
}
