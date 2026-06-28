FROM emscripten/emsdk@sha256:d0be652409a4d3362b8a36c3279dd1123ff1c9327e603d86d9361aa84f1d2e4c
# emsdk 6.0.1 ☝️

# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && npm install -g jest

# Set up the working directory
WORKDIR /workspace
