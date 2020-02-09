from flask_admin import Admin
from flask_admin.menu import MenuLink
from flask_admin.contrib.sqla import ModelView

from persistence.model import db
from persistence.model.account_store import User, Store
from persistence.model.movement import Movement
from persistence.model.category import Category
from persistence.model.company import Company
from persistence.model.item import Item, Batch


class CartageModelView(ModelView):
    # can_delete = False  # disable model deletion
    page_size = 50  # the number of entries to display on the list view

    create_modal = True
    edit_modal = True

    can_create = True
    can_edit = False
    can_delete = False


class CartageMovementModelView(ModelView):
    column_searchable_list = ['quantity']
    column_filters = ['quantity']
    form_ajax_refs = {
        'company': {
            'fields': ['id', 'name'],
            'page_size': 10
        }
    }


def setup_admin_home(app):
    admin = Admin(app, name='cartage', template_mode='bootstrap3')
    admin.add_view(CartageModelView(User, db.session, category="Profile"))
    # admin.add_view(ModelView(Store, db.session, category="Profile"))
    # admin.add_view(CartageMovementModelView(Movement, db.session))
    admin.add_view(ModelView(Category, db.session))
    admin.add_view(ModelView(Company, db.session))
    admin.add_view(ModelView(Item, db.session))
    admin.add_view(ModelView(Batch, db.session))

    admin.add_link(MenuLink(name='Home Page', url='/', category='Links'))
    admin.add_link(MenuLink(name='Contacts', url='/contacts', category='Links'))
    
