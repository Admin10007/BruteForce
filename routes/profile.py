from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from db import db
from models.user import User
import os
from werkzeug.utils import secure_filename

profile_bp = Blueprint('profile', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@profile_bp.route('/')
@login_required
def profile():
    return render_template('profile.html', user=current_user)

@profile_bp.route('/edit', methods=['POST'])
@login_required
def edit_profile():
    name = request.form.get('name')
    email = request.form.get('email')
    profile_image = request.files.get('profile_image')

    user = User.query.get(current_user.id)
    if User.query.filter_by(email=email).first() and email != user.email:
        flash('Bu email allaqachon ishlatilmoqda!', 'danger')
        return redirect(url_for('profile.profile'))

    user.name = name
    user.email = email

    if profile_image and allowed_file(profile_image.filename):
        filename = secure_filename(profile_image.filename)
        file_path = os.path.join('static/uploads', filename)
        profile_image.save(file_path)
        user.profile_image = f'uploads/{filename}'

    db.session.commit()
    flash('Ma’lumotlar muvaffaqiyatli yangilandi!', 'success')
    return redirect(url_for('profile.profile'))

@profile_bp.route('/change_password', methods=['POST'])
@login_required
def change_password():
    current_password = request.form.get('current_password')
    new_password = request.form.get('new_password')
    confirm_password = request.form.get('confirm_password')

    user = User.query.get(current_user.id)
    if not user.check_password(current_password):
        flash('Joriy parol noto‘g‘ri!', 'danger')
        return redirect(url_for('profile.profile'))

    if new_password != confirm_password:
        flash('Yangi parol va tasdiqlash mos kelmadi!', 'danger')
        return redirect(url_for('profile.profile'))

    user.set_password(new_password)
    db.session.commit()
    flash('Parol muvaffaqiyatli yangilandi!', 'success')
    return redirect(url_for('profile.profile'))