"use client";

import { useI18n } from "@/lib/i18n";

export interface BasicInformationValues {
  fullName: string;
  headline: string;
  profilePictureUrl: string;
}

export interface BasicInformationErrors {
  fullName?: string;
  headline?: string;
  profilePictureUrl?: string;
}

export default function BasicInformationStep({
  values,
  errors,
  onChange,
}: {
  values: BasicInformationValues;
  errors?: BasicInformationErrors;
  onChange: (patch: Partial<BasicInformationValues>) => void;
}) {
  const { t } = useI18n();

  return (
    <section className="basic-info-step" aria-labelledby="basic-info-title">
      <div className="basic-info-card">
        <div className="basic-info-head">
          <span className="basic-info-count">Step 1 of 4</span>
          <h3 id="basic-info-title">{t("profile.basics")}</h3>
          <p>{t("profile.basicsSub")}</p>
        </div>

        <div className="basic-info-grid">
          <label className="basic-info-field">
            <span>
              {t("profile.fullName")}
              <b aria-hidden="true"> *</b>
            </span>
            <input
              type="text"
              autoComplete="name"
              value={values.fullName}
              placeholder={t("auth.fullNamePlaceholder")}
              onChange={(event) => onChange({ fullName: event.target.value })}
            />
            {errors?.fullName ? <em>{errors.fullName}</em> : null}
          </label>

          <label className="basic-info-field">
            <span>
              {t("profile.headline")}
              <b aria-hidden="true"> *</b>
            </span>
            <input
              type="text"
              value={values.headline}
              placeholder={t("profile.headlinePlaceholder")}
              onChange={(event) => onChange({ headline: event.target.value })}
            />
            {errors?.headline ? <em>{errors.headline}</em> : null}
          </label>

          <label className="basic-info-field basic-info-field-wide">
            <span>{t("profile.avatarUrl")}</span>
            <input
              type="url"
              value={values.profilePictureUrl}
              placeholder={t("profile.avatarUrlPlaceholder")}
              onChange={(event) => onChange({ profilePictureUrl: event.target.value })}
            />
            {errors?.profilePictureUrl ? <em>{errors.profilePictureUrl}</em> : null}
          </label>
        </div>
      </div>
    </section>
  );
}
