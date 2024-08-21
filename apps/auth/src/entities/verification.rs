use nanoid::nanoid;
use sqlx::FromRow;
use uuid::Uuid;

use crate::error::Error;

#[derive(FromRow, Serialize)]
#[sqlx(rename_all = "camelCase")]
pub struct AccountVerification {
    pub id: Uuid,
    pub category: String,
    pub token: String,
    pub account_id: Uuid,
    pub expires_at: time::OffsetDateTime,
}

impl AccountVerification {
    pub async fn find_by_token(
        token: &str,
        category: &str,
        db: &sqlx::PgPool,
    ) -> Result<Self, Error> {
        let verification: AccountVerification = sqlx::query_as(
            r#"
            SELECT * FROM account_verifications
            WHERE token = $1
            AND expires_at > NOW()
            "#,
        )
        .bind(token)
        .fetch_one(db)
        .await
        .map_err(|_| Error::NotFound)?;

        if verification.category != category {
            return Err(Error::NotFound);
        }

        if (verification.expires_at - time::OffsetDateTime::now_utc()).whole_seconds() < 0 {
            return Err(Error::NotFound);
        }

        Ok(verification)
    }

    pub async fn create_password_reset(account_id: Uuid, db: &sqlx::PgPool) -> Result<Self, Error> {
        let verification = Self {
            id: Uuid::new_v4(),
            category: "PASSWORD_RESET".to_string(),
            token: nanoid!(48),
            account_id,
            expires_at: time::OffsetDateTime::now_utc() + time::Duration::hours(1),
        };
        sqlx::query(
            r#"
            INSERT INTO account_verifications (id, category, token, account_id, expires_at)
            VALUES ($1, $2, $3, $4, $5)
            "#,
        )
        .bind(&verification.id)
        .bind(&verification.category)
        .bind(&verification.token)
        .bind(&verification.account_id)
        .bind(&verification.expires_at)
        .execute(db)
        .await?;
        Ok(verification)
    }

    pub async fn delete(&self, db: &sqlx::PgPool) -> Result<(), Error> {
        sqlx::query(
            r#"
            DELETE FROM account_verifications
            WHERE id = $1
            "#,
        )
        .bind(&self.id)
        .execute(db)
        .await?;
        Ok(())
    }
}
