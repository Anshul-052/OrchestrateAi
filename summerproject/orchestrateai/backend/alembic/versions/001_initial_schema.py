"""initial_schema

Revision ID: 001
Revises: 
Create Date: 2024-05-27 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'workflows',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('definition', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workflows_id'), 'workflows', ['id'], unique=False)
    op.create_index(op.f('ix_workflows_user_id'), 'workflows', ['user_id'], unique=False)

    op.create_table(
        'workflow_runs',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('workflow_id', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('logs', sa.JSON(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workflow_runs_id'), 'workflow_runs', ['id'], unique=False)
    op.create_index(op.f('ix_workflow_runs_workflow_id'), 'workflow_runs', ['workflow_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_workflow_runs_workflow_id'), table_name='workflow_runs')
    op.drop_index(op.f('ix_workflow_runs_id'), table_name='workflow_runs')
    op.drop_table('workflow_runs')
    op.drop_index(op.f('ix_workflows_user_id'), table_name='workflows')
    op.drop_index(op.f('ix_workflows_id'), table_name='workflows')
    op.drop_table('workflows')
