"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import type {
  ShootingDistance,
  ShootingGuideDeviceType,
  ShootingGuideEntry,
  ShootingGuideOption,
  ShootingSituation,
  ShootingSubject,
  ShootingTip,
} from "@/services/shooting-guide/shooting-guide-types";
import { getShootingGuide } from "@/services/shooting-guide/shooting-guide-service";
import {
  isUserDeviceType,
  readStoredDeviceType,
  storeDeviceType,
} from "@/services/user-context/device-type-preference";

type ShootingGuideScreenMessages = {
  title: string;
  description: string;
  categoryLabel: string;
  subjectLabel: string;
  distanceLabel: string;
  deviceLabel: string;
  resultTitle: string;
  resultDescription: string;
  empty: string;
  backToUpload: string;
  detailButton: string;
  collapseButton: string;
  detailLabel: string;
  whyLabel: string;
  whenLabel: string;
  exampleLabel: string;
  settingLabel: string;
  copyDirectionLabel: string;
  focusLabel: string;
  lensLabel: string;
  phoneLabel: string;
};

type ShootingGuideScreenProps = {
  situations: ShootingGuideOption<ShootingSituation>[];
  subjects: ShootingGuideOption<ShootingSubject>[];
  distances: ShootingGuideOption<ShootingDistance>[];
  deviceTypes: ShootingGuideOption<ShootingGuideDeviceType>[];
  initialGuide: ShootingGuideEntry;
  messages: ShootingGuideScreenMessages;
};

const SHOW_SHOOTING_GUIDE_EXAMPLE_IMAGES = false;

type ShootingTipDetailRow = {
  label: string;
  value: string | undefined;
};

type QuickTipCardProps = {
  tip: ShootingTip;
  index: number;
  isExpanded: boolean;
  detailRows: ShootingTipDetailRow[];
  detailButtonLabel: string;
  collapseButtonLabel: string;
  onToggle: () => void;
};

function QuickTipCard({
  tip,
  index,
  isExpanded,
  detailRows,
  detailButtonLabel,
  collapseButtonLabel,
  onToggle,
}: QuickTipCardProps) {
  return (
    <section
      style={{
        ...styles.tipCard,
        ...(isExpanded ? styles.tipCardExpanded : null),
      }}
    >
      <div style={styles.tipIndex}>{String(index + 1).padStart(2, "0")}</div>
      <h3 style={styles.tipTitle}>{tip.tipTitle}</h3>
      <p style={styles.tipBody}>{tip.tipShort}</p>
      <button
        type="button"
        style={styles.detailButton}
        aria-expanded={isExpanded}
        onClick={onToggle}
      >
        {isExpanded ? collapseButtonLabel : detailButtonLabel}
      </button>
      {isExpanded ? (
        <div style={styles.detailPanel}>
          {SHOW_SHOOTING_GUIDE_EXAMPLE_IMAGES && tip.exampleImages?.length ? (
            <div style={styles.exampleImageGrid}>
              {tip.exampleImages.slice(0, 2).map((image) => (
                <figure key={`${tip.tipTitle}-${image.src}`} style={styles.exampleImageCard}>
                  <img
                    src={image.src}
                    alt={image.alt ?? image.label}
                    data-fallback-src={image.fallbackSrc}
                    style={styles.exampleImage}
                    onError={(event) => {
                      const fallbackSrc = event.currentTarget.dataset.fallbackSrc;

                      if (fallbackSrc && !event.currentTarget.src.endsWith(fallbackSrc)) {
                        event.currentTarget.src = fallbackSrc;
                        return;
                      }

                      event.currentTarget.style.visibility = "hidden";
                    }}
                  />
                  <figcaption style={styles.exampleImageLabel}>{image.label}</figcaption>
                </figure>
              ))}
            </div>
          ) : null}
          {detailRows.map((row) => (
            <div key={row.label} style={styles.detailRow}>
              <span style={styles.detailLabel}>{row.label}</span>
              <span style={styles.detailText}>{row.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ShootingGuideScreen({
  situations,
  subjects,
  distances,
  deviceTypes,
  initialGuide,
  messages,
}: ShootingGuideScreenProps) {
  const [situation, setSituation] = useState<ShootingSituation>(initialGuide.context.situation);
  const [subject, setSubject] = useState<ShootingSubject>(initialGuide.context.subject);
  const [distance, setDistance] = useState<ShootingDistance>(initialGuide.context.distance);
  const [deviceType, setDeviceType] = useState<ShootingGuideDeviceType>(
    initialGuide.context.deviceType,
  );
  const [expandedTipIndex, setExpandedTipIndex] = useState<number | null>(null);

  const guide = useMemo(
    () => getShootingGuide({ situation, subject, distance, deviceType }),
    [situation, subject, distance, deviceType],
  );

  useEffect(() => {
    const queryDeviceType = new URLSearchParams(window.location.search).get("deviceType");

    if (isUserDeviceType(queryDeviceType)) {
      setDeviceType(queryDeviceType);
      storeDeviceType(queryDeviceType);
      return;
    }

    const storedDeviceType = readStoredDeviceType();

    if (storedDeviceType) {
      setDeviceType(storedDeviceType);
    }
  }, []);

  const onSelectDeviceType = (value: ShootingGuideDeviceType) => {
    setDeviceType(value);
    storeDeviceType(value);
  };

  return (
    <section style={styles.layout}>
      <article style={styles.heroCard}>
        <div style={styles.copyStack}>
          <h2 style={styles.title}>{messages.title}</h2>
          <p style={styles.description}>{messages.description}</p>
        </div>

        <div style={styles.controlGrid}>
          <label style={styles.field}>
            <span style={styles.label}>{messages.categoryLabel}</span>
            <select
              value={situation}
              onChange={(event) => {
                setSituation(event.target.value as ShootingSituation);
                setExpandedTipIndex(null);
              }}
              style={styles.select}
            >
              {situations.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>{messages.subjectLabel}</span>
            <select
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value as ShootingSubject);
                setExpandedTipIndex(null);
              }}
              style={styles.select}
            >
              {subjects.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>{messages.distanceLabel}</span>
            <select
              value={distance}
              onChange={(event) => {
                setDistance(event.target.value as ShootingDistance);
                setExpandedTipIndex(null);
              }}
              style={styles.select}
            >
              {distances.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>{messages.deviceLabel}</span>
            <select
              value={deviceType}
              onChange={(event) => onSelectDeviceType(event.target.value as ShootingGuideDeviceType)}
              style={styles.select}
            >
              {deviceTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </article>

      <article style={styles.resultCard}>
        <div style={styles.resultHeader}>
          <div>
            <div style={styles.resultTitle}>{messages.resultTitle}</div>
            <p style={styles.resultDescription}>{messages.resultDescription}</p>
          </div>
        </div>

        {guide.tips.length > 0 ? (
          <div style={styles.tipGrid}>
            {guide.tips.map((tip, index) => {
              const isExpanded = expandedTipIndex === index;
              const settingRows = [
                tip.approxWhiteBalance ? `WB ${tip.approxWhiteBalance}` : null,
                tip.approxAperture ? tip.approxAperture : null,
                tip.approxShutterSpeed ? tip.approxShutterSpeed : null,
                tip.approxISO ? `ISO ${tip.approxISO}` : null,
                tip.approxExposureComp ? `EV ${tip.approxExposureComp}` : null,
              ].filter(Boolean);
              const detailRows = [
                { label: messages.detailLabel, value: tip.tipDetail },
                { label: messages.whyLabel, value: tip.tipWhy },
                { label: messages.whenLabel, value: tip.tipWhen },
                { label: messages.exampleLabel, value: tip.tipExample },
                {
                  label: messages.settingLabel,
                  value: settingRows.length > 0 ? settingRows.join(" · ") : undefined,
                },
                {
                  label: messages.copyDirectionLabel,
                  value: tip.recommendedCopyDirection?.join(" / "),
                },
                { label: messages.focusLabel, value: tip.focusHint },
                { label: messages.lensLabel, value: tip.lensHint },
                { label: messages.phoneLabel, value: tip.phoneCameraHint },
              ].filter((row) => row.value);

              return (
                <QuickTipCard
                  key={`${tip.tipTitle}-${index}`}
                  tip={tip}
                  index={index}
                  isExpanded={isExpanded}
                  detailRows={detailRows}
                  detailButtonLabel={messages.detailButton}
                  collapseButtonLabel={messages.collapseButton}
                  onToggle={() =>
                    setExpandedTipIndex((current) => (current === index ? null : index))
                  }
                />
              );
            })}
          </div>
        ) : (
          <div style={styles.empty}>{messages.empty}</div>
        )}
      </article>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  layout: {
    display: "grid",
    gap: "20px",
  },
  heroCard: {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
    padding: "28px",
    borderRadius: "30px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,241,231,0.82))",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    boxShadow: "0 22px 64px rgba(91, 60, 36, 0.12)",
    backdropFilter: "blur(14px)",
  },
  copyStack: {
    display: "grid",
    gap: "10px",
    alignContent: "center",
  },
  title: {
    margin: 0,
    color: "#211b16",
    fontSize: "22px",
    lineHeight: 1.25,
    letterSpacing: "-0.03em",
    fontWeight: 800,
  },
  description: {
    margin: 0,
    color: "#5f564d",
    lineHeight: 1.7,
    fontSize: "14px",
    maxWidth: "620px",
  },
  controlGrid: {
    display: "grid",
    gap: "14px",
  },
  field: {
    display: "grid",
    gap: "8px",
  },
  label: {
    color: "#2f2923",
    fontSize: "13px",
    fontWeight: 800,
  },
  select: {
    width: "100%",
    minHeight: "46px",
    borderRadius: "16px",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    background: "rgba(255,255,255,0.94)",
    color: "#1f1b17",
    padding: "10px 12px",
    fontSize: "14px",
  },
  resultCard: {
    display: "grid",
    gap: "18px",
    padding: "24px",
    borderRadius: "30px",
    background: "rgba(255, 255, 255, 0.82)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    boxShadow: "0 20px 60px rgba(91, 60, 36, 0.1)",
    backdropFilter: "blur(14px)",
  },
  resultHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    flexWrap: "wrap",
  },
  resultTitle: {
    color: "#231d18",
    fontSize: "16px",
    fontWeight: 800,
    letterSpacing: "-0.01em",
  },
  resultDescription: {
    margin: "6px 0 0",
    color: "#6b6055",
    fontSize: "13px",
    lineHeight: 1.6,
  },
  tipGrid: {
    display: "grid",
    gap: "14px",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  tipCard: {
    display: "grid",
    gap: "10px",
    alignContent: "start",
    minHeight: "178px",
    padding: "18px",
    borderRadius: "22px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(250,244,235,0.84))",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    boxShadow: "0 14px 34px rgba(91, 60, 36, 0.08)",
    transition: "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
  },
  tipCardExpanded: {
    border: "1px solid rgba(180, 102, 63, 0.24)",
    boxShadow: "0 20px 42px rgba(91, 60, 36, 0.14)",
    transform: "translateY(-1px)",
  },
  tipIndex: {
    width: "fit-content",
    padding: "6px 9px",
    borderRadius: "999px",
    background: "rgba(180, 102, 63, 0.1)",
    color: "#8f4725",
    fontSize: "11px",
    fontWeight: 800,
  },
  tipTitle: {
    margin: 0,
    color: "#231d18",
    fontSize: "15px",
    lineHeight: 1.35,
    fontWeight: 800,
  },
  tipBody: {
    margin: 0,
    color: "#4f463e",
    fontSize: "13px",
    lineHeight: 1.65,
  },
  detailButton: {
    justifySelf: "start",
    border: "1px solid rgba(64, 47, 30, 0.12)",
    borderRadius: "999px",
    padding: "7px 11px",
    background: "rgba(255, 250, 244, 0.86)",
    color: "#4f392d",
    fontSize: "12px",
    fontWeight: 850,
    cursor: "pointer",
  },
  detailPanel: {
    display: "grid",
    gap: "9px",
    overflow: "hidden",
    padding: "12px",
    borderRadius: "16px",
    background: "rgba(255, 250, 244, 0.78)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    animation: "shootingGuideDetailReveal 160ms ease both",
  },
  exampleImageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "8px",
  },
  exampleImageCard: {
    display: "grid",
    gap: "6px",
    margin: 0,
  },
  exampleImage: {
    width: "100%",
    aspectRatio: "4 / 3",
    objectFit: "cover",
    borderRadius: "12px",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    background: "rgba(255,255,255,0.72)",
  },
  exampleImageLabel: {
    color: "#6b6055",
    fontSize: "11px",
    fontWeight: 800,
    lineHeight: 1.35,
  },
  detailRow: {
    display: "grid",
    gap: "3px",
  },
  detailLabel: {
    color: "#8a5a38",
    fontSize: "10px",
    fontWeight: 900,
  },
  detailText: {
    color: "#4f463e",
    fontSize: "12px",
    lineHeight: 1.45,
    fontWeight: 650,
  },
  empty: {
    padding: "18px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.74)",
    border: "1px dashed rgba(64, 47, 30, 0.14)",
    color: "#7b6f63",
  },
};
