{
  description = "TypeScript development environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, utils }:
    utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_24
            typescript
            typescript-language-server
          ];

          shellHook = ''
            echo "TypeScript development environment loaded!"
            echo "Node version: $(node -v)"
            echo "TSC version: $(tsc -v)"
          '';
        };
      });
}
