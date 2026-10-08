import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import main
from database import Base
from models import Role, Tenant, User
from schemas import SignupCreate, UserCreate


@pytest.fixture
def account_db(monkeypatch):
    engine = create_engine('sqlite://')
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    session.add_all([Role(id=1, name='user'), Role(id=3, name='tenant'), Tenant(id=6, name='Zara')])
    session.commit()
    calls = []
    monkeypatch.setattr(main, 'create_keycloak_user', lambda *args: calls.append(args))
    yield session, calls
    session.close()
    engine.dispose()


def test_signup_uses_same_normalized_username_in_both_systems(account_db):
    db, calls = account_db
    result = main.signup(SignupCreate(username=' NormalUser2 ', password='test-only'), db)
    assert result['username'] == 'normaluser2'
    assert calls[0][0] == 'normaluser2'
    assert db.query(User).one().username == 'normaluser2'


def test_admin_creation_preserves_tenant_link(account_db):
    db, calls = account_db
    result = main.create_user(UserCreate(username=' ZaraUser2 ', password='test-only', tenant_id=6, role_id=3), db, {})
    assert (result.username, result.tenant_id, result.role_id) == ('zarauser2', 6, 3)
    assert calls[0][0] == 'zarauser2'


@pytest.mark.parametrize('admin', [False, True])
def test_existing_mixed_case_account_is_duplicate(account_db, admin):
    db, calls = account_db
    db.add(User(username='ExistingUser', role_id=1))
    db.commit()
    with pytest.raises(HTTPException) as exc:
        if admin:
            main.create_user(UserCreate(username='existingUSER', password='test-only', role_id=1), db, {})
        else:
            main.signup(SignupCreate(username='existingUSER', password='test-only'), db)
    assert exc.value.status_code == 400
    assert calls == []


@pytest.mark.parametrize('admin', [False, True])
def test_empty_username_does_not_create_keycloak_account(account_db, admin):
    db, calls = account_db
    with pytest.raises(HTTPException) as exc:
        if admin:
            main.create_user(UserCreate(username='   ', password='test-only', role_id=1), db, {})
        else:
            main.signup(SignupCreate(username='   ', password='test-only'), db)
    assert exc.value.status_code == 400
    assert calls == []
