from flask import Blueprint, jsonify

page_bp = Blueprint('page', __name__)

@page_bp.get('/')
def index():
    return jsonify({"message": "This backend is API-only. Serve the frontend from the 'frontend' folder."})