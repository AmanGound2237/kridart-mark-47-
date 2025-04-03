import streamlit as st
import json
import base64
from pathlib import Path
import uuid
import os

# Configuration
ASSETS_DIR = "assets"
os.makedirs(ASSETS_DIR, exist_ok=True)

# Initialize session state
if 'game' not in st.session_state:
    st.session_state.game = {
        "title": "New Game",
        "projectData": {
            "objects": [],
            "settings": {}
        }
    }

if 'assets' not in st.session_state:
    st.session_state.assets = {
        "characters": [
            {"id": "char1", "name": "Player", "icon": "👨", "type": "character"},
            {"id": "char2", "name": "Enemy", "icon": "👾", "type": "character"}
        ],
        "environment": [
            {"id": "env1", "name": "Tree", "icon": "🌳", "type": "environment"}
        ],
        "items": [
            {"id": "item1", "name": "Sword", "icon": "⚔️", "type": "item"}
        ]
    }

if 'selected_object' not in st.session_state:
    st.session_state.selected_object = None

# Helper functions
def save_game():
    """Save game data to a file"""
    with open("game.json", "w") as f:
        json.dump(st.session_state.game, f)
    st.success("Game saved successfully!")

def load_game():
    """Load game data from a file"""
    try:
        with open("game.json", "r") as f:
            st.session_state.game = json.load(f)
        st.success("Game loaded successfully!")
    except FileNotFoundError:
        st.error("No saved game found")

def handle_asset_upload(uploaded_file):
    """Process uploaded asset files"""
    if uploaded_file is not None:
        # Generate unique filename
        file_ext = Path(uploaded_file.name).suffix
        file_id = str(uuid.uuid4())
        file_path = os.path.join(ASSETS_DIR, f"{file_id}{file_ext}")
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        
        # Add to assets
        asset_type = "environment"  # Default type
        if uploaded_file.type.startswith("image/"):
            asset_type = "environment"
        elif uploaded_file.type.startswith("audio/"):
            asset_type = "sound"
            
        new_asset = {
            "id": file_id,
            "name": Path(uploaded_file.name).stem,
            "path": file_path,
            "type": asset_type
        }
        
        st.session_state.assets[asset_type].append(new_asset)
        st.success(f"Asset {uploaded_file.name} uploaded!")

def handle_ai_command(command):
    """Process AI commands"""
    if "faster" in command.lower():
        if st.session_state.selected_object:
            st.session_state.selected_object["speed"] = 10
            return "Increased speed to 10"
    return f"Processed command: {command}"

# Main App Layout
st.set_page_config(layout="wide", page_title="Kridart Game Engine")

# Sidebar - Asset Library
with st.sidebar:
    st.title("🎮 Kridart Assets")
    
    # Asset categories
    asset_category = st.selectbox(
        "Asset Type",
        ["Characters", "Environment", "Items"]
    )
    
    # Display assets
    if asset_category == "Characters":
        for asset in st.session_state.assets["characters"]:
            if st.button(f"{asset['icon']} {asset['name']}"):
                st.session_state.selected_object = {
                    "id": asset["id"],
                    "type": asset["type"],
                    "name": asset["name"],
                    "x": 100,
                    "y": 100
                }
    
    # Asset upload
    st.subheader("Upload Assets")
    uploaded_file = st.file_uploader(
        "Choose an asset file",
        type=["png", "jpg", "jpeg", "gif", "mp3", "wav"]
    )
    if uploaded_file:
        handle_asset_upload(uploaded_file)

# Main Editor Area
col1, col2 = st.columns([3, 1])

with col1:
    st.header("Game Canvas")
    
    # Canvas placeholder (Streamlit doesn't have a native canvas, so we use an image)
    canvas_placeholder = st.empty()
    
    # Display game objects
    for obj in st.session_state.game["projectData"]["objects"]:
        st.write(f"{obj.get('icon', '🟦')} {obj.get('name', 'Object')} at ({obj['x']}, {obj['y']})")
    
    # Add selected object to game
    if st.session_state.selected_object:
        if st.button("Add to Game"):
            st.session_state.game["projectData"]["objects"].append(
                st.session_state.selected_object
            )
            st.session_state.selected_object = None
            st.experimental_rerun()

# Properties Panel
with col2:
    st.header("Properties")
    
    if st.session_state.selected_object:
        st.subheader(st.session_state.selected_object["name"])
        
        # Position controls
        col_x, col_y = st.columns(2)
        with col_x:
            x_pos = st.number_input("X Position", value=st.session_state.selected_object.get("x", 100))
        with col_y:
            y_pos = st.number_input("Y Position", value=st.session_state.selected_object.get("y", 100))
        
        st.session_state.selected_object["x"] = x_pos
        st.session_state.selected_object["y"] = y_pos
        
        # Other properties
        if "speed" in st.session_state.selected_object:
            speed = st.slider("Speed", 1, 20, st.session_state.selected_object["speed"])
            st.session_state.selected_object["speed"] = speed
    else:
        st.write("Select an object to edit properties")

# AI Assistant at bottom
with st.expander("🤖 AI Assistant", expanded=False):
    ai_command = st.text_input("How can I help with your game?")
    if ai_command:
        response = handle_ai_command(ai_command)
        st.write(f"AI: {response}")

# Game management
st.sidebar.header("Game Management")
if st.sidebar.button("New Game"):
    st.session_state.game = {
        "title": "New Game",
        "projectData": {
            "objects": [],
            "settings": {}
        }
    }

st.sidebar.button("Save Game", on_click=save_game)
st.sidebar.button("Load Game", on_click=load_game)

# Download game JSON
st.sidebar.download_button(
    label="Export Game",
    data=json.dumps(st.session_state.game),
    file_name="game.json",
    mime="application/json"
)
