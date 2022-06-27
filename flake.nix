{
  description = "loc-sdk-ts";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      rec {
        pkgs = import nixpkgs {
          inherit system;
        };
        devShell = pkgs.callPackage ./dev-shell.nix { };
      }
    );
}
