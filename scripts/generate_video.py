"""
CommonScene — Automated 1080p Hackathon Demo Video Generator
Uses: Playwright, Google Chrome/Chromium, Edge-TTS (Neural TTS), FFmpeg, FFprobe, and HTML5/CSS3.
"""

import asyncio
import os
import sys
import subprocess
import json
import base64
from pathlib import Path

# Ensure UTF-8 stdout on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import edge_tts
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
BUILD_DIR = ROOT / "video_build"
OUTPUT_DIR = ROOT / "docs" / "assets"
FINAL_VIDEO = OUTPUT_DIR / "CommonScene_Demo_Video_1080p.mp4"

# Standard Upper Right Corner Logo Header Template
HEADER_UPPER_RIGHT = """
<div style="position:absolute;top:50px;right:80px;display:flex;align-items:center;gap:14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);padding:10px 22px;border-radius:18px;backdrop-filter:blur(16px);box-shadow:0 8px 30px rgba(0,0,0,0.4);z-index:999;">
    <img src="{LOGO_URL}" style="width:44px;height:44px;border-radius:10px;display:block;box-shadow:0 0 20px rgba(99,102,241,0.5);" />
    <div style="display:flex;flex-direction:column;text-align:left;">
        <span style="font-size:20px;font-weight:800;letter-spacing:0.5px;color:#ffffff;line-height:1.2;">CommonScene</span>
        <span style="font-size:12px;font-weight:700;color:#818cf8;letter-spacing:1px;text-transform:uppercase;">Fire TV • Vega OS</span>
    </div>
</div>
"""

# Scene Script matching the hackathon 2:45 submission video specification
SCENES = [
    {
        "id": "scene1_intro",
        "title": "The Group Movie Dilemma",
        "voice_text": (
            "We have all been there on movie night. Thirty minutes of scrolling through streaming menus, "
            "arguing over genres, runtimes, and ratings, until everyone loses interest. "
            "Traditional recommendation algorithms optimize for a single profile, completely ignoring the group dynamic."
        ),
        "html": """
        <div style="width:1920px;height:1080px;background:radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0f172a 60%, #030712 100%);color:white;font-family:'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;box-sizing:border-box;padding:80px;position:relative;">
            
            <!-- Upper Left Pill -->
            <div style="position:absolute;top:50px;left:80px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);padding:12px 24px;border-radius:999px;color:#f87171;font-size:18px;font-weight:700;display:flex;align-items:center;gap:10px;">
                <span>⚠️</span> The Problem: Movie-Night Paralysis
            </div>

            <!-- Upper Right Logo -->
            {HEADER_UPPER_RIGHT}

            <div style="text-align:center;max-width:1200px;margin-top:60px;">
                <h1 style="font-size:64px;font-weight:800;line-height:1.2;margin:0 0 24px 0;background:linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #818cf8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
                    30 Minutes of Scrolling.<br/>Zero Consensus.
                </h1>
                <p style="font-size:30px;color:#94a3b8;line-height:1.5;margin:0 0 60px 0;">
                    Single-user algorithms fail groups. Runtimes clash, genres conflict, and nobody agrees.
                </p>
            </div>

            <div style="display:flex;gap:40px;width:100%;max-width:1400px;justify-content:center;">
                <div style="flex:1;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:36px;backdrop-filter:blur(20px);">
                    <div style="font-size:48px;margin-bottom:16px;">⏳</div>
                    <h3 style="font-size:26px;color:#f1f5f9;margin:0 0 12px 0;">Hard Time Constraints</h3>
                    <p style="font-size:20px;color:#94a3b8;margin:0;">"Kids need to sleep in 90 minutes" — but streaming algorithms push 3-hour epics.</p>
                </div>
                <div style="flex:1;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:36px;backdrop-filter:blur(20px);">
                    <div style="font-size:48px;margin-bottom:16px;">🙅‍♂️</div>
                    <h3 style="font-size:26px;color:#f1f5f9;margin:0 0 12px 0;">Conflicting Tastes</h3>
                    <p style="font-size:20px;color:#94a3b8;margin:0;">One person hates horror, another wants comedy, and ratings boundaries are crossed.</p>
                </div>
                <div style="flex:1;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:36px;backdrop-filter:blur(20px);">
                    <div style="font-size:48px;margin-bottom:16px;">📱</div>
                    <h3 style="font-size:26px;color:#f1f5f9;margin:0 0 12px 0;">Isolated Profiles</h3>
                    <p style="font-size:20px;color:#94a3b8;margin:0;">No way for multiple people on the couch to democratically combine their preferences.</p>
                </div>
            </div>
        </div>
        """
    },
    {
        "id": "scene2_tv_launch",
        "title": "Fire TV First Experience",
        "voice_text": (
            "CommonScene is a Fire TV first group recommendation experience built on Vega OS. "
            "The host creates a room right on the living room television, displaying a large four-letter room code and QR join link. "
            "The entire interface is optimized for 10-foot viewing with full D-pad remote navigation."
        ),
        "html": """
        <div style="width:1920px;height:1080px;background:radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0f172a 60%, #030712 100%);color:white;font-family:'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column;box-sizing:border-box;padding:60px 80px;position:relative;">
            
            <!-- Upper Left Pill -->
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:30px;">
                <span style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);padding:10px 22px;border-radius:999px;color:#4ade80;font-size:18px;font-weight:700;display:flex;align-items:center;gap:8px;">
                    <span style="width:10px;height:10px;background:#4ade80;border-radius:50%;display:inline-block;"></span> Living Room Host
                </span>
                <span style="background:#4338ca;color:#c7d2fe;font-size:14px;font-weight:800;padding:6px 14px;border-radius:8px;">VEGA OS • 10-FOOT UI</span>
            </div>

            <!-- Upper Right Logo -->
            {HEADER_UPPER_RIGHT}

            <div style="display:flex;gap:60px;flex:1;align-items:center;">
                <!-- TV Screen Visual -->
                <div style="flex:1.4;background:rgba(15,23,42,0.85);border:2px solid rgba(99,102,241,0.5);border-radius:28px;padding:40px;box-shadow:0 20px 60px rgba(0,0,0,0.6);">
                    <div style="text-align:center;margin-bottom:30px;">
                        <span style="color:#818cf8;font-size:20px;font-weight:700;letter-spacing:3px;">ROOM CODE</span>
                        <div style="font-size:80px;font-weight:900;letter-spacing:16px;color:#ffffff;text-shadow:0 0 30px rgba(99,102,241,0.8);margin:10px 0;">BKJS</div>
                        <p style="color:#94a3b8;font-size:22px;margin:0;">Scan QR on phone or visit commonscene.tv</p>
                    </div>
                    <div style="display:flex;gap:20px;justify-content:center;">
                        <div style="background:rgba(255,255,255,0.06);border:2px solid #818cf8;padding:24px 40px;border-radius:18px;text-align:center;transform:scale(1.02);box-shadow:0 0 25px rgba(99,102,241,0.4);">
                            <div style="font-size:22px;font-weight:700;color:#ffffff;">👥 3 Viewers Joined</div>
                            <div style="font-size:16px;color:#a5b4fc;margin-top:6px;">Ready to Submit Preferences</div>
                        </div>
                    </div>
                </div>

                <!-- Feature Highlights -->
                <div style="flex:1;display:flex;flex-direction:column;gap:24px;">
                    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:28px;">
                        <h3 style="font-size:24px;color:#818cf8;margin:0 0 8px 0;">🎮 D-Pad Navigation</h3>
                        <p style="font-size:18px;color:#cbd5e1;margin:0;">100% remote controllable with prominent ≥3px visual focus indicators.</p>
                    </div>
                    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:28px;">
                        <h3 style="font-size:24px;color:#818cf8;margin:0 0 8px 0;">📺 5% TV-Safe Margins</h3>
                        <p style="font-size:18px;color:#cbd5e1;margin:0;">Strict overscan protection guarantees perfect visibility on any television.</p>
                    </div>
                    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:28px;">
                        <h3 style="font-size:24px;color:#818cf8;margin:0 0 8px 0;">⚡ Realtime WebSocket Hub</h3>
                        <p style="font-size:18px;color:#cbd5e1;margin:0;">Instant bidirectional synchronization between TV and all mobile clients.</p>
                    </div>
                </div>
            </div>
        </div>
        """
    },
    {
        "id": "scene3_mobile_join",
        "title": "Zero-Friction Mobile Participation",
        "voice_text": (
            "Everyone in the room joins instantly on their phones. There are no apps to install, no accounts, and no passwords. "
            "Participants select preferred genres, moods, maximum runtime caps, and content tags, or simply type natural language preferences."
        ),
        "html": """
        <div style="width:1920px;height:1080px;background:radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0f172a 60%, #030712 100%);color:white;font-family:'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column;box-sizing:border-box;padding:60px 80px;position:relative;">
            
            <!-- Upper Left Pill -->
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:30px;">
                <span style="background:#0284c7;color:#e0f2fe;font-size:14px;font-weight:800;padding:6px 14px;border-radius:8px;">REACT 19 • MOBILE PWA</span>
                <span style="color:#94a3b8;font-size:18px;font-weight:600;">Zero Login • Zero App Install</span>
            </div>

            <!-- Upper Right Logo -->
            {HEADER_UPPER_RIGHT}

            <div style="display:flex;gap:50px;flex:1;align-items:center;justify-content:center;">
                <!-- Phone 1 (Alice) -->
                <div style="width:420px;background:#0f172a;border:2px solid #334155;border-radius:36px;padding:28px;box-shadow:0 25px 60px rgba(0,0,0,0.6);">
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:14px;color:#4ade80;margin-bottom:16px;">
                        <span>● Live Sync</span>
                        <span style="color:#94a3b8;font-weight:600;">Alice 🦊</span>
                    </div>
                    <div style="background:#1e293b;border-radius:18px;padding:20px;margin-bottom:16px;">
                        <div style="font-size:14px;color:#94a3b8;margin-bottom:8px;">PREFERRED GENRES</div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            <span style="background:#4f46e5;color:white;padding:6px 14px;border-radius:999px;font-size:14px;">Comedy</span>
                            <span style="background:#4f46e5;color:white;padding:6px 14px;border-radius:999px;font-size:14px;">Adventure</span>
                        </div>
                    </div>
                    <div style="background:#1e293b;border-radius:18px;padding:20px;margin-bottom:16px;">
                        <div style="font-size:14px;color:#94a3b8;margin-bottom:8px;">MAX RUNTIME</div>
                        <div style="font-size:18px;font-weight:700;color:#38bdf8;">105 Minutes</div>
                    </div>
                    <div style="background:#4338ca;color:white;text-align:center;padding:14px;border-radius:14px;font-weight:700;">✓ Preferences Saved</div>
                </div>

                <!-- Phone 2 (Bob) -->
                <div style="width:420px;background:#0f172a;border:2px solid #334155;border-radius:36px;padding:28px;box-shadow:0 25px 60px rgba(0,0,0,0.6);">
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:14px;color:#4ade80;margin-bottom:16px;">
                        <span>● Live Sync</span>
                        <span style="color:#94a3b8;font-weight:600;">Bob 🐼</span>
                    </div>
                    <div style="background:#1e293b;border-radius:18px;padding:20px;margin-bottom:16px;">
                        <div style="font-size:14px;color:#94a3b8;margin-bottom:8px;">MOOD</div>
                        <div style="display:flex;gap:8px;">
                            <span style="background:#4f46e5;color:white;padding:6px 14px;border-radius:999px;font-size:14px;">Feel-Good</span>
                            <span style="background:#4f46e5;color:white;padding:6px 14px;border-radius:999px;font-size:14px;">Inspiring</span>
                        </div>
                    </div>
                    <div style="background:#1e293b;border-radius:18px;padding:20px;margin-bottom:16px;">
                        <div style="font-size:14px;color:#94a3b8;margin-bottom:8px;">NATURAL LANGUAGE NOTE</div>
                        <div style="font-size:15px;color:#cbd5e1;font-style:italic;">"Heartwarming movie for family night, no gore"</div>
                    </div>
                    <div style="background:#4338ca;color:white;text-align:center;padding:14px;border-radius:14px;font-weight:700;">✓ Preferences Saved</div>
                </div>
            </div>
        </div>
        """
    },
    {
        "id": "scene4_consensus_ai",
        "title": "Mathematical Fairness & Amazon Bedrock",
        "voice_text": (
            "Our deterministic consensus engine runs a mathematical fairness formula that guarantees hard constraints like runtime and ratings are never overridden. "
            "Amazon Bedrock generates natural, grounded consensus explanations so everyone understands why the movie fits the whole group."
        ),
        "html": """
        <div style="width:1920px;height:1080px;background:radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0f172a 60%, #030712 100%);color:white;font-family:'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column;box-sizing:border-box;padding:50px 80px;position:relative;">
            
            <!-- Upper Left Pill -->
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                <span style="background:rgba(147,51,234,0.2);border:1px solid rgba(147,51,234,0.5);padding:8px 20px;border-radius:999px;color:#c084fc;font-size:16px;font-weight:700;">
                    Formula: 0.45·Avg + 0.35·Min + 0.20·Coverage
                </span>
                <span style="background:#3b82f6;color:white;font-size:13px;font-weight:800;padding:6px 12px;border-radius:6px;">AMAZON BEDROCK AI</span>
            </div>

            <!-- Upper Right Logo -->
            {HEADER_UPPER_RIGHT}

            <!-- Top 3 Recommendation Cards -->
            <div style="display:flex;gap:30px;flex:1;align-items:stretch;">
                <div style="flex:1;background:rgba(30,41,59,0.7);border:2px solid #818cf8;border-radius:24px;padding:32px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 0 30px rgba(99,102,241,0.3);">
                    <div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                            <span style="background:#4338ca;color:#e0e7ff;font-size:14px;font-weight:800;padding:4px 12px;border-radius:6px;">TOP MATCH #1</span>
                            <span style="font-size:24px;font-weight:900;color:#38bdf8;">94%</span>
                        </div>
                        <h2 style="font-size:32px;font-weight:800;margin:0 0 8px 0;color:#ffffff;">Starlight Odyssey</h2>
                        <div style="font-size:16px;color:#94a3b8;margin-bottom:16px;">2024 • 118 min • PG • Sci-Fi / Adventure</div>
                        <p style="font-size:18px;color:#cbd5e1;line-height:1.5;margin:0 0 16px 0;">A brave crew embarks on an uncharted journey across the cosmos to discover the lost beacon of humanity.</p>
                    </div>
                    <div style="background:rgba(99,102,241,0.1);border-left:4px solid #818cf8;padding:14px;border-radius:0 12px 12px 0;">
                        <span style="font-size:13px;font-weight:700;color:#818cf8;text-transform:uppercase;">🤖 Bedrock Explanation:</span>
                        <p style="font-size:15px;color:#e2e8f0;margin:4px 0 0 0;">Satisfies Alice's adventure preference and Bob's inspiring mood within group PG rating limit.</p>
                    </div>
                </div>

                <div style="flex:1;background:rgba(30,41,59,0.5);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:32px;display:flex;flex-direction:column;justify-content:space-between;">
                    <div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                            <span style="background:rgba(255,255,255,0.1);color:#94a3b8;font-size:14px;font-weight:800;padding:4px 12px;border-radius:6px;">MATCH #2</span>
                            <span style="font-size:24px;font-weight:900;color:#94a3b8;">88%</span>
                        </div>
                        <h2 style="font-size:32px;font-weight:800;margin:0 0 8px 0;color:#ffffff;">The Clockwork Bakery</h2>
                        <div style="font-size:16px;color:#94a3b8;margin-bottom:16px;">2023 • 94 min • G • Comedy / Family</div>
                        <p style="font-size:18px;color:#cbd5e1;line-height:1.5;margin:0 0 16px 0;">An eccentric inventor builds a mechanical bakery that accidentally bakes magical pastries.</p>
                    </div>
                    <div style="background:rgba(255,255,255,0.05);border-left:4px solid #94a3b8;padding:14px;border-radius:0 12px 12px 0;">
                        <span style="font-size:13px;font-weight:700;color:#94a3b8;text-transform:uppercase;">🤖 Bedrock Explanation:</span>
                        <p style="font-size:15px;color:#e2e8f0;margin:4px 0 0 0;">Fits under Alice's 105m runtime limit with feel-good family comedy.</p>
                    </div>
                </div>

                <div style="flex:1;background:rgba(30,41,59,0.5);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:32px;display:flex;flex-direction:column;justify-content:space-between;">
                    <div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                            <span style="background:rgba(255,255,255,0.1);color:#94a3b8;font-size:14px;font-weight:800;padding:4px 12px;border-radius:6px;">MATCH #3</span>
                            <span style="font-size:24px;font-weight:900;color:#94a3b8;">82%</span>
                        </div>
                        <h2 style="font-size:32px;font-weight:800;margin:0 0 8px 0;color:#ffffff;">Echoes of the Forest</h2>
                        <div style="font-size:16px;color:#94a3b8;margin-bottom:16px;">2024 • 88 min • G • Animation / Adventure</div>
                        <p style="font-size:18px;color:#cbd5e1;line-height:1.5;margin:0 0 16px 0;">A young forest spirit embarks on a quest to restore harmony to the ancient canopy.</p>
                    </div>
                    <div style="background:rgba(255,255,255,0.05);border-left:4px solid #94a3b8;padding:14px;border-radius:0 12px 12px 0;">
                        <span style="font-size:13px;font-weight:700;color:#94a3b8;text-transform:uppercase;">🤖 Bedrock Explanation:</span>
                        <p style="font-size:15px;color:#e2e8f0;margin:4px 0 0 0;">Shortest runtime with high general appeal across all viewers.</p>
                    </div>
                </div>
            </div>
        </div>
        """
    },
    {
        "id": "scene5_voting_winner",
        "title": "Live 1-Tap Voting & Winner Celebration",
        "voice_text": (
            "The top three candidates appear on the TV. Everyone casts a quick one-tap vote on their phone, "
            "and the TV crowns the winning movie with cinema fanfare!"
        ),
        "html": """
        <div style="width:1920px;height:1080px;background:radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0f172a 60%, #030712 100%);color:white;font-family:'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;box-sizing:border-box;padding:60px 80px;position:relative;">
            
            <!-- Upper Left Pill -->
            <div style="position:absolute;top:50px;left:80px;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);padding:10px 22px;border-radius:999px;color:#4ade80;font-size:18px;font-weight:700;display:flex;align-items:center;gap:8px;">
                <span>🗳️</span> Realtime Group Vote Complete
            </div>

            <!-- Upper Right Logo -->
            {HEADER_UPPER_RIGHT}

            <!-- Winner Presentation Card -->
            <div style="background:rgba(15,23,42,0.85);border:3px solid #f59e0b;border-radius:36px;padding:60px 80px;max-width:1000px;text-align:center;box-shadow:0 0 80px rgba(245,158,11,0.3);position:relative;">
                <div style="font-size:64px;margin-bottom:12px;">🍿 🎉</div>
                <div style="font-size:20px;font-weight:800;color:#f59e0b;letter-spacing:4px;margin-bottom:12px;">TONIGHT'S WINNER</div>
                <h1 style="font-size:60px;font-weight:900;color:#ffffff;margin:0 0 16px 0;text-shadow:0 4px 20px rgba(0,0,0,0.5);">Starlight Odyssey</h1>
                <div style="display:flex;gap:16px;justify-content:center;align-items:center;font-size:22px;color:#94a3b8;margin-bottom:24px;">
                    <span>2024</span>
                    <span>•</span>
                    <span>118 min</span>
                    <span>•</span>
                    <span style="background:#0284c7;color:white;padding:4px 14px;border-radius:8px;font-weight:800;font-size:18px;">PG</span>
                    <span>•</span>
                    <span>Sci-Fi, Adventure</span>
                </div>
                <p style="font-size:22px;color:#cbd5e1;line-height:1.6;margin:0 0 36px 0;">
                    A brave crew embarks on an uncharted journey across the cosmos to discover the lost beacon of humanity.
                </p>
                <div style="background:#10b981;color:white;font-size:24px;font-weight:800;padding:18px 48px;border-radius:18px;display:inline-block;box-shadow:0 10px 30px rgba(16,185,129,0.4);">
                    ▶ Ready to Watch on Fire TV
                </div>
            </div>
        </div>
        """
    },
    {
        "id": "scene6_conclusion",
        "title": "Architecture & Open Source",
        "voice_text": (
            "CommonScene is built with React Native on Vega OS, Amazon Bedrock, Fastify WebSockets, and AWS CDK. "
            "It includes a 100% offline fallback and is completely open source under Apache-2.0. "
            "Stop scrolling, start watching — with CommonScene."
        ),
        "html": """
        <div style="width:1920px;height:1080px;background:radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0f172a 60%, #030712 100%);color:white;font-family:'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;box-sizing:border-box;padding:60px 80px;position:relative;">
            
            <!-- Upper Right Logo -->
            {HEADER_UPPER_RIGHT}

            <img src="{LOGO_URL}" style="width:120px;height:120px;border-radius:28px;box-shadow:0 0 50px rgba(99,102,241,0.6);margin-bottom:24px;" />
            
            <h1 style="font-size:56px;font-weight:900;margin:0 0 12px 0;background:linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #818cf8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
                CommonScene
            </h1>
            <p style="font-size:26px;color:#cbd5e1;margin:0 0 40px 0;">
                Fire TV-First Group Movie Recommendation
            </p>

            <div style="display:flex;gap:24px;margin-bottom:50px;">
                <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);padding:14px 28px;border-radius:14px;font-size:18px;font-weight:700;color:#f8fafc;">
                    📺 React Native (Vega OS)
                </div>
                <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);padding:14px 28px;border-radius:14px;font-size:18px;font-weight:700;color:#f8fafc;">
                    🤖 Amazon Bedrock (Claude 3.5 / Nova)
                </div>
                <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);padding:14px 28px;border-radius:14px;font-size:18px;font-weight:700;color:#f8fafc;">
                    ☁️ AWS CDK (DynamoDB, S3, CloudFront)
                </div>
                <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);padding:14px 28px;border-radius:14px;font-size:18px;font-weight:700;color:#f8fafc;">
                    📜 100% Apache-2.0 Open Source
                </div>
            </div>

            <div style="font-size:32px;font-weight:800;color:#818cf8;letter-spacing:1px;">
                Stop scrolling. Start watching.
            </div>
            <div style="font-size:20px;color:#94a3b8;margin-top:10px;">
                github.com/pakorn269/commonscene
            </div>
        </div>
        """
    }
]

def get_audio_duration(file_path: Path) -> float:
    cmd = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(file_path)
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    return float(res.stdout.strip())

async def generate_voiceover(text: str, output_path: Path):
    communicate = edge_tts.Communicate(text, voice="en-US-ChristopherNeural")
    await communicate.save(str(output_path))

async def main():
    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Read logo as base64 Data URI for 100% reliable rendering
    logo_file = ROOT / "docs" / "assets" / "logo.png"
    with open(logo_file, "rb") as f:
        logo_base64 = f"data:image/png;base64,{base64.b64encode(f.read()).decode('utf-8')}"

    # Format upper right header with base64 logo
    formatted_header = HEADER_UPPER_RIGHT.replace("{LOGO_URL}", logo_base64)

    print("🎬 Starting CommonScene Demo Video Generation...")
    print(f"📁 Build Directory: {BUILD_DIR}")
    
    clip_files = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1920, "height": 1080})

        for i, scene in enumerate(SCENES, 1):
            scene_id = scene["id"]
            print(f"\n--- Processing Scene {i}/{len(SCENES)}: {scene['title']} ---")
            
            # 1. Generate Voiceover Audio
            audio_path = BUILD_DIR / f"{scene_id}.mp3"
            print("🎙️ Generating voiceover audio...")
            await generate_voiceover(scene["voice_text"], audio_path)
            duration = get_audio_duration(audio_path)
            total_duration = duration + 0.5
            print(f"⏱️ Audio duration: {duration:.2f}s (Total video clip: {total_duration:.2f}s)")

            # 2. Render HTML & Take Screenshot
            frame_path = BUILD_DIR / f"{scene_id}.png"
            rendered_html = (
                scene["html"]
                .replace("{HEADER_UPPER_RIGHT}", formatted_header)
                .replace("{LOGO_URL}", logo_base64)
            )
            await page.set_content(rendered_html, wait_until="networkidle")
            await page.wait_for_timeout(400)
            await page.screenshot(path=str(frame_path))
            print(f"📸 1080p frame captured: {frame_path.name}")

            # 3. Create MP4 Video Clip with FFmpeg
            clip_path = BUILD_DIR / f"{scene_id}.mp4"
            print("🎞️ Encoding MP4 video clip...")
            cmd = [
                "ffmpeg", "-y",
                "-loop", "1",
                "-i", str(frame_path),
                "-i", str(audio_path),
                "-c:v", "libx264",
                "-tune", "stillimage",
                "-c:a", "aac",
                "-b:a", "192k",
                "-pix_fmt", "yuv420p",
                "-t", str(total_duration),
                str(clip_path)
            ]
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            clip_files.append(clip_path)

        await browser.close()

    # 4. Concatenate All Video Clips into Final Video
    print("\n📦 Concatenating all scenes into final video...")
    concat_list = BUILD_DIR / "concat_list.txt"
    with open(concat_list, "w", encoding="utf-8") as f:
        for clip in clip_files:
            f.write(f"file '{clip.resolve().as_posix()}'\n")

    cmd_concat = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_list),
        "-c", "copy",
        str(FINAL_VIDEO)
    ]
    subprocess.run(cmd_concat, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)

    final_duration = get_audio_duration(FINAL_VIDEO)
    minutes = int(final_duration // 60)
    seconds = int(final_duration % 60)
    file_size_mb = FINAL_VIDEO.stat().st_size / (1024 * 1024)

    print(f"\n🎉 Demo Video Successfully Created!")
    print(f"📹 Output Path: {FINAL_VIDEO}")
    print(f"⏱️ Total Duration: {minutes}m {seconds}s ({final_duration:.1f}s)")
    print(f"📦 File Size: {file_size_mb:.2f} MB")
    print("🌟 Ready for YouTube/Vimeo upload and Devpost submission!")

if __name__ == "__main__":
    asyncio.run(main())
