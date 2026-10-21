FROM eclipse-temurin:17-jdk

ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    unzip \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22 (required by React Native 0.87)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn

# Install Android SDK command line tools
RUN mkdir -p $ANDROID_HOME/cmdline-tools \
    && wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip \
    && unzip -q /tmp/cmdline-tools.zip -d $ANDROID_HOME/cmdline-tools \
    && mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest \
    && rm /tmp/cmdline-tools.zip

# Accept licenses and install required SDK components
RUN yes | sdkmanager --licenses > /dev/null 2>&1 || true

# Install platform tools, build tools, and platforms
RUN sdkmanager \
    "platform-tools" \
    "platforms;android-37" \
    "build-tools;37.0.0" \
    "platforms;android-36" \
    "build-tools;36.0.0" \
    "platforms;android-35" \
    "build-tools;35.0.0" || true

# Install NDK (needed for React Native 0.87)
RUN yes | sdkmanager "ndk;27.1.12297006" || true

# Install CMake (needed for native builds)
RUN yes | sdkmanager "cmake;3.22.1" || true

WORKDIR /app
CMD ["bash"]