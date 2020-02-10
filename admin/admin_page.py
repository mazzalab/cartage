from flask import redirect, url_for
from flask_admin import Admin, AdminIndexView
from flask_admin.menu import MenuLink
from flask_admin.contrib.sqla import ModelView
from flask_login import current_user

from persistence.model import db
from persistence.model.account_store import User, Store
from persistence.model.movement import Movement
from persistence.model.category import Category
from persistence.model.company import Company
from persistence.model.item import Item, Batch


class CartageUserModelView(ModelView):
    # can_delete = False  # disable model deletion
    page_size = 50  # the number of entries to display on the list view

    create_modal = True
    edit_modal = True

    # can_create = True
    # can_edit = False
    # can_delete = False
    
    form_excluded_columns = ['movements', ]

    def is_accessible(self):
        return not current_user.is_authenticated

    def inaccessible_callback(self, name, **kwargs):
        # TODO: set here a page with a message saying that only masters can enter
        return redirect(url_for('login'))


class CartageMovementModelView(ModelView):
    column_searchable_list = ['quantity']
    column_filters = ['quantity']
    

class CartageAdminIndexView(AdminIndexView):
    def is_accessible(self):
        # TODO: check that the user is not only authenticated but also that his role is master
        return not current_user.is_authenticated


def setup_admin_home(app):
    admin = Admin(app, name='cartage', template_mode='bootstrap3', index_view=CartageAdminIndexView())
    admin.add_view(CartageUserModelView(User, db.session, category="Profile"))
    admin.add_view(ModelView(Store, db.session, category="Profile"))
    # admin.add_view(CartageMovementModelView(Movement, db.session))
    admin.add_view(ModelView(Category, db.session))
    admin.add_view(ModelView(Company, db.session))
    admin.add_view(ModelView(Item, db.session))
    admin.add_view(ModelView(Batch, db.session))

    admin.add_link(MenuLink(name='Home Page', url='/', category='Links'))
    admin.add_link(MenuLink(name='Contacts', url='/contacts', category='Links'))
    
