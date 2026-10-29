from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, StudentProfile, CareerRole
from app.schemas.schemas import UserProfileUpdate
from app.api.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    career_info = None
    if profile.target_career_id:
        career = db.query(CareerRole).filter(CareerRole.id == profile.target_career_id).first()
        if career:
            career_info = {
                "id": career.id,
                "title": career.title,
                "slug": career.slug,
                "category": career.category
            }

    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "college": profile.college,
        "degree": profile.degree,
        "branch": profile.branch,
        "graduation_year": profile.graduation_year,
        "bio": profile.bio,
        "target_career_id": profile.target_career_id,
        "target_career": career_info,
        "learning_pace": profile.learning_pace,
        "weekly_learning_hours": profile.weekly_learning_hours,
        "preferred_learning_style": profile.preferred_learning_style,
        "onboarded": profile.onboarded
    }

@router.put("")
def update_profile(
    update_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)

    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name

    for field, val in update_data.dict(exclude_unset=True).items():
        if field != "full_name" and hasattr(profile, field):
            setattr(profile, field, val)

    db.commit()
    return {"message": "Profile updated successfully."}

@router.post("/onboard")
def complete_onboarding(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)

    for field, val in data.dict(exclude_unset=True).items():
        if field == "full_name":
            current_user.full_name = val
        elif hasattr(profile, field):
            setattr(profile, field, val)

    profile.onboarded = True
    db.commit()
    return {"message": "Onboarding completed successfully.", "onboarded": True}

@router.delete("/account")
def delete_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(current_user)
    db.commit()
    return {"message": "User account and all associated data permanently deleted."}
