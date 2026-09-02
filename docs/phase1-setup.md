# Phase 1 — Vega Simulator Setup Guide (WSL 2 & Linux)

This document covers the exact, verified steps to install the Vega Developer
Tools (VDT), launch the Vega Virtual Device (VVD) with KVM hardware acceleration
under WSL 2 on Windows 11 (or Ubuntu 24.04 LTS), and build and deploy the
CommonScene TV app.

---

## 1. Prerequisites (WSL 2 on Windows 11)

WSL 2 on Windows 11 provides native KVM nested virtualization (`/dev/kvm`) and
WSLg GUI window integration out-of-the-box.

### Ubuntu 24.04 Setup in WSL

```powershell
# From Windows PowerShell / Terminal
wsl --install -d Ubuntu-24.04
```

### Install Linux System Dependencies

Inside Ubuntu 24.04:

```bash
sudo apt update && sudo apt install -y \
  ca-certificates curl gnupg build-essential git \
  jq unzip zip wget libssl-dev libffi-dev \
  qemu-kvm cpu-checker libjpeg62 libjpeg-turbo8

# Verify KVM hardware acceleration
kvm-ok
# Must output:
# INFO: /dev/kvm exists
# KVM acceleration can be used
```

### Install Node.js 20 LTS

```bash
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt update && sudo apt install -y nodejs
```

---

## 2. Install Vega Developer Tools (VDT)

Run the installer as a regular (non-root) user:

```bash
curl -fsSL https://sdk-installer.vega.labcollab.net/get_vvm.sh | bash
```

Install the active Vega SDK (includes the Vega Virtual Device):

```bash
/home/$USER/vega/bin/vega sdk install --non-interactive
```

Add the Vega environment variables to `~/.bashrc`:

```bash
cat << 'EOF' >> ~/.bashrc
export PATH="/home/$USER/vega/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export DISPLAY=":0"
export WAYLAND_DISPLAY="wayland-0"
export XDG_RUNTIME_DIR="/mnt/wslg/runtime-dir"
export PULSE_SERVER="unix:/mnt/wslg/PulseServer"
EOF
source ~/.bashrc
```

Verify installation:

```bash
vega --version
# Vega CLI Version: 1.3.4 (Active SDK Version: 0.24.9914)
```

---

## 3. Launching the Vega Virtual Device (VVD)

Start the VVD in the background with software OpenGL (recommended for WSL 2):

```bash
SDK_DIR=/home/$USER/vega/sdk/vega-sdk/main/0.24.9914
AGENT_DIR=$SDK_DIR/vvd/images/tv/vmtools/agent
INSTANCE_DIR=$(ls -d $SDK_DIR/vvd/instances/* | head -n 1)

export LD_LIBRARY_PATH=$AGENT_DIR/lib64:$AGENT_DIR/lib64/qt/lib:$AGENT_DIR/lib64/gles_swiftshader:/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH
export QT_QPA_PLATFORM_PLUGIN_PATH=$AGENT_DIR/lib64/qt/plugins

$AGENT_DIR/qemu/linux-x86_64/vega-virtual-device \
  -avd-arch x86_64 \
  -skindir $AGENT_DIR/skins \
  -skin tv-remote \
  -ports 5554,5555 \
  -gpu off \
  -dns-server auto \
  -sysdir $INSTANCE_DIR \
  -datadir $INSTANCE_DIR \
  -data $INSTANCE_DIR/userdata.qcow2 \
  -keyboard-mapping KEY_ESC:KEY_BACK,KEY_F1:KEY_HOMEPAGE,KEY_F2:KEY_MENU,KEY_F3:KEY_REWIND,KEY_F4:KEY_PLAYPAUSE,KEY_F5:KEY_FASTFORWARD \
  -qemu -qmp unix:/tmp/qmp-socket-5554.sock,server,nowait &
```

Check device status:

```bash
vega device list
# VirtualDevice : tv - x86_64 - OS - amazon-...
```

---

## 4. Building and Deploying CommonScene TV

### Build the Package

From the `apps/tv` directory:

```bash
cd apps/tv
npm run build:release
```

### Pack and Install to Vega Virtual Device

```bash
# Stage in ext4 and pack
rm -rf /tmp/tv_stage /tmp/tv_output
mkdir -p /tmp/tv_stage /tmp/tv_output
cp -r build/private/vega/x86_64/Release/* /tmp/tv_stage/
/home/$USER/vega/sdk/vega-sdk/main/0.24.9914/bin/tools/vpt pack /tmp/tv_stage -n tv_x86_64 -d /tmp/tv_output --validate

# Push and install
/home/$USER/vega/sdk/vega-sdk/main/0.24.9914/bin/tools/vda -s emulator-5554 push /tmp/tv_output/tv_x86_64.vpkg /tmp/tv_x86_64.vpkg
/home/$USER/vega/sdk/vega-sdk/main/0.24.9914/bin/tools/vda -s emulator-5554 shell vpm install /tmp/tv_x86_64.vpkg

# Launch CommonScene
vega device launch-app -d VirtualDevice --appName com.commonscene.tv.main
```

---

## 5. D-pad Navigation Key Mappings

| Remote Action | QMP / Keyboard Key  | Function in CommonScene          |
| ------------- | ------------------- | -------------------------------- |
| D-pad Up      | Up Arrow (`up`)     | Focus "Create Room"              |
| D-pad Down    | Down Arrow (`down`) | Focus "Demo Mode"                |
| Select        | Enter (`ret`)       | Activate focused button          |
| Back          | Escape (`esc`)      | Return to previous screen / exit |

---

## 6. Host API Connectivity

The Vega simulator can reach the host Fastify development server at `http://10.0.2.2:3001`:

```bash
/home/$USER/vega/sdk/vega-sdk/main/0.24.9914/bin/tools/vda -s emulator-5554 shell wget -qO- http://10.0.2.2:3001/health
# {"status":"ok","version":"0.1.0","timestamp":"2026-09-02T02:52:00.689Z"}
```

---

## Confirmed Tool Versions

| Tool                   | Version                              | Status   |
| ---------------------- | ------------------------------------ | -------- |
| OS                     | Windows 11 + WSL 2 (Kernel 6.6.87.2) | Verified |
| WSL Distro             | Ubuntu 24.04 LTS (noble)             | Verified |
| Node.js                | v20.20.2 LTS                         | Verified |
| npm                    | 10.8.2                               | Verified |
| Vega CLI               | 1.3.4                                | Verified |
| Vega SDK               | 0.24.9914 (Channel: main)            | Verified |
| Vega OS Virtual Device | OS 1.2 (`vvrp-tv-x64`)               | Verified |
| React Native           | 0.83.0 / Kepler 4.0.1                | Verified |
