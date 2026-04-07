export declare function readShaderFile(filePath: string): Promise<string>;

export declare function compileShader(
    gl: WebGL2RenderingContext,
    source: string,
    type: number
): WebGLShader | null;

export declare function createProgram(
    gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string
): WebGLProgram | null;

export declare class Shader {
    constructor(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string);
    gl: WebGL2RenderingContext;
    program: WebGLProgram;

    use(): void;
    setAttribPointer(name: string, size: number, type: number, normalized: boolean, stride: number, offset: number): void;
    setBool(name: string, value: boolean): void;
    setInt(name: string, value: number): void;
    setFloat(name: string, value: number): void;
    setVec2(name: string, x: number | Float32List, y?: number): void;
    setVec3(name: string, x: number | Float32List, y?: number, z?: number): void;
    setVec4(name: string, x: number | Float32List, y?: number, z?: number, w?: number): void;
    setMat2(name: string, mat: Float32List): void;
    setMat3(name: string, mat: Float32List): void;
    setMat4(name: string, mat: Float32List): void;
}
