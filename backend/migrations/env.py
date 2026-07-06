import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from app.core.config import settings
from app.models import AuditLog, Base, File, Initiative, User  # noqa: F811

# Alembic Config object — provides access to values in alembic.ini.
config = context.config

# Override sqlalchemy.url from application settings so credentials
# never need to be hardcoded inside alembic.ini.
config.set_main_option("sqlalchemy.url", settings.POSTGRES_ASYNC_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Autogenerate compares the models registered on Base.metadata
# against the live database schema and emits the appropriate DDL.
target_metadata = Base.metadata

# Keep unused model imports visible to suppress linter warnings.
_referenced_models = (User, Initiative, File, AuditLog)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (emit SQL without a live DB)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Create an async engine from config and run migrations."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (against a live database)."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
