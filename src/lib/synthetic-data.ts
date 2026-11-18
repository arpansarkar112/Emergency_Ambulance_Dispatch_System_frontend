import type {
  AmbulanceItem,
  AuditLogItem,
  DispatchRequestItem,
} from "@/types";

const PRIORITIES: DispatchRequestItem["priority"][] = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
];

const REQUEST_STATUSES: DispatchRequestItem["status"][] = [
  "PENDING",
  "ASSIGNED",
  "EN_ROUTE",
  "PICKED_UP",
  "COMPLETED",
  "CANCELLED",
];

const HOSPITALS = [
  "Metro General Trauma Center",
  "St. Jude Cardiac & Vascular Institute",
  "Children's Regional Neonatal Hub",
  "University Neuro & Stroke Center",
  "Parkview Emergency Medical Center",
  "Harborview Critical Care Pavilion",
];

const PICKUP_SECTORS = [
  "Midtown Medical Corridor, Block 4",
  "Parkview Residential Avenue, Apt 12B",
  "Downtown Financial Plaza, North Entrance",
  "Westside Highway Mile 14 Urgent Clinic",
  "Harbor District Terminal 3 First Aid Bay",
  "Northgate Senior Living Campus, Wing C",
];

const AMBULANCE_TYPES: AmbulanceItem["type"][] = ["ICU", "BASIC", "PEDIATRIC"];
const AMBULANCE_STATUSES: AmbulanceItem["status"][] = [
  "AVAILABLE",
  "BUSY",
  "MAINTENANCE",
];

const STATIONS = [
  "Midtown Trauma Hub",
  "Northside Cardiac Base",
  "Harbor Pediatric Station",
  "West End Emergency Depot",
  "Downtown Rapid Response Bay",
];

const AUDIT_ACTIONS = [
  "DISPATCH_ALLOCATED",
  "STATUS_TRANSITION_EN_ROUTE",
  "STATUS_TRANSITION_COMPLETED",
  "STRIPE_INVOICE_ISSUED",
  "FLEET_READINESS_UPDATED",
  "CRITICAL_TRIAGE_MATCHED",
];

let cachedSyntheticRequests: DispatchRequestItem[] | null = null;
let cachedSyntheticAmbulances: AmbulanceItem[] | null = null;
let cachedSyntheticAuditLogs: AuditLogItem[] | null = null;

/**
 * Deterministically generates 1,200 representative emergency dispatch records
 * cached in memory so repeated renders incur zero allocation overhead.
 */
export function getSyntheticRequests(targetCount = 1200): DispatchRequestItem[] {
  if (cachedSyntheticRequests && cachedSyntheticRequests.length === targetCount) {
    return cachedSyntheticRequests;
  }

  const baseTime = 1763500000000;
  const generated: DispatchRequestItem[] = Array.from(
    { length: targetCount },
    (_, idx) => {
      const priority = PRIORITIES[idx % PRIORITIES.length];
      const status = REQUEST_STATUSES[(idx % (REQUEST_STATUSES.length - 1)) + 1];
      const isCompleted = status === "COMPLETED";
      const amount = isCompleted ? 120 + (idx % 6) * 35 : 0;
      const isPaid = isCompleted && idx % 3 !== 0;
      const tier: AmbulanceItem["type"] =
        priority === "CRITICAL" || priority === "HIGH" ? "ICU" : "BASIC";
      const unitNum = 100 + (idx % 90);
      const reqId = `sim-req-${String(idx + 1).padStart(5, "0")}`;
      const patientId = `sim-patient-${(idx % 300) + 1}`;
      const phone = `+1 (555) ${String(200 + (idx % 799)).padStart(3, "0")}-${String(1000 + (idx % 8999)).padStart(4, "0")}`;

      const ambObj: AmbulanceItem = {
        id: `sim-amb-${unitNum}`,
        vehicleNumber: `MED-${tier === "ICU" ? "ICU" : "BLS"}-${unitNum}`,
        title: `${tier} Response Unit #${unitNum}`,
        description: `Certified ${tier} medical transport unit`,
        type: tier,
        status:
          status === "COMPLETED" || status === "CANCELLED"
            ? "AVAILABLE"
            : "BUSY",
        basePrice: tier === "ICU" ? 220 : 115,
        rating: 4.8,
        reviewCount: 24,
        images: ["/images/icu-ambulance-exterior.jpg"],
        specifications: ["Transport Mechanical Ventilator"],
        capacity: 3,
        responseTime: "5-8 mins",
        featured: false,
        currentAddress: STATIONS[idx % STATIONS.length],
      };

      return {
        id: reqId,
        patientId,
        patientPhone: phone,
        pickupAddress: `${100 + (idx % 850)} ${PICKUP_SECTORS[idx % PICKUP_SECTORS.length]}`,
        destinationAddress: HOSPITALS[idx % HOSPITALS.length],
        priority,
        status,
        amount,
        paymentStatus: isPaid ? "SUCCESS" : isCompleted ? "PENDING" : undefined,
        payment:
          amount > 0
            ? {
                id: `sim-pay-${idx + 1}`,
                requestId: reqId,
                patientId,
                amount,
                currency: "USD",
                status: isPaid ? "SUCCESS" : "PENDING",
              }
            : null,
        createdAt: new Date(baseTime - (idx + 1) * 900_000).toISOString(),
        updatedAt: new Date(baseTime - idx * 840_000).toISOString(),
        patient: {
          id: patientId,
          email: `patient.${(idx % 450) + 1}@metrohealth.org`,
          role: "PATIENT",
          profile: {
            id: `sim-prof-${idx + 1}`,
            userId: patientId,
            firstName: "Patient",
            lastName: `#${idx + 1}`,
            phone,
          },
        },
        ambulance: ambObj,
      };
    }
  );

  cachedSyntheticRequests = generated;
  return generated;
}

export function mergeWithRepresentativeRequests(
  liveRequests: DispatchRequestItem[],
  enableHighVolume = true,
  minTotal = 1200
): DispatchRequestItem[] {
  if (!enableHighVolume || liveRequests.length >= minTotal) {
    return liveRequests;
  }
  const needed = minTotal - liveRequests.length;
  const synthetic = getSyntheticRequests(minTotal).slice(0, needed);
  return [...liveRequests, ...synthetic];
}

/**
 * Deterministically generates 1,200 representative ambulance fleet units.
 */
export function getSyntheticAmbulances(targetCount = 1200): AmbulanceItem[] {
  if (
    cachedSyntheticAmbulances &&
    cachedSyntheticAmbulances.length === targetCount
  ) {
    return cachedSyntheticAmbulances;
  }

  const generated: AmbulanceItem[] = Array.from(
    { length: targetCount },
    (_, idx) => {
      const type = AMBULANCE_TYPES[idx % AMBULANCE_TYPES.length];
      const status = AMBULANCE_STATUSES[idx % AMBULANCE_STATUSES.length];
      const code =
        type === "ICU" ? "ICU" : type === "PEDIATRIC" ? "PED" : "BLS";
      const basePrice = type === "ICU" ? 225 : type === "PEDIATRIC" ? 195 : 115;
      const driverId = `sim-drv-${(idx % 60) + 1}`;

      return {
        id: `sim-amb-${String(idx + 1).padStart(5, "0")}`,
        vehicleNumber: `MED-${code}-${String(1000 + idx)}`,
        title: `${type} Response Unit #${1000 + idx}`,
        description: `Certified ${type} medical transport vehicle with onboard telemetry and rapid response trauma kit.`,
        type,
        status,
        basePrice: basePrice + (idx % 5) * 10,
        capacity: (idx % 3) + 2,
        rating: Number((4.5 + (idx % 5) * 0.1).toFixed(1)),
        reviewCount: 14 + (idx % 64),
        responseTime: type === "ICU" ? "5-7 mins" : "6-9 mins",
        featured: idx % 10 === 0,
        currentAddress: STATIONS[idx % STATIONS.length],
        driverId,
        driver: {
          id: driverId,
          email: `driver.${(idx % 60) + 1}@callambulance.health`,
          role: "DRIVER",
        },
        specifications: [
          "Transport Mechanical Ventilator",
          "12-Lead Cardiac Telemetry",
          "Dual Oxygen Manifolds",
        ],
        images: [
          type === "ICU"
            ? "/images/icu-ambulance-exterior.jpg"
            : type === "PEDIATRIC"
              ? "/images/pediatric-ambulance.jpg"
              : "/images/bls-ambulance-exterior.jpg",
        ],
      };
    }
  );

  cachedSyntheticAmbulances = generated;
  return generated;
}

export function mergeWithRepresentativeAmbulances(
  liveAmbulances: AmbulanceItem[],
  enableHighVolume = true,
  minTotal = 1200
): AmbulanceItem[] {
  if (!enableHighVolume || liveAmbulances.length >= minTotal) {
    return liveAmbulances;
  }
  const needed = minTotal - liveAmbulances.length;
  const synthetic = getSyntheticAmbulances(minTotal).slice(0, needed);
  return [...liveAmbulances, ...synthetic];
}

/**
 * Deterministically generates 1,500 representative dispatch audit log entries.
 */
export function getSyntheticAuditLogs(targetCount = 1500): AuditLogItem[] {
  if (cachedSyntheticAuditLogs && cachedSyntheticAuditLogs.length === targetCount) {
    return cachedSyntheticAuditLogs;
  }

  const baseTime = 1763500000000;
  const generated: AuditLogItem[] = Array.from(
    { length: targetCount },
    (_, idx) => ({
      id: `sim-audit-${String(idx + 1).padStart(5, "0")}`,
      action: AUDIT_ACTIONS[idx % AUDIT_ACTIONS.length],
      entity: idx % 2 === 0 ? "DispatchRequest" : "AmbulanceUnit",
      entityId: `ent-${String(10000 + idx)}`,
      createdAt: new Date(baseTime - idx * 300_000).toISOString(),
      user: {
        email:
          idx % 3 === 0
            ? "admin@ambulance.com"
            : `coordinator.${(idx % 12) + 1}@callambulance.health`,
        role: "ADMIN",
      },
    })
  );

  cachedSyntheticAuditLogs = generated;
  return generated;
}

export function mergeWithRepresentativeAuditLogs(
  liveLogs: AuditLogItem[],
  enableHighVolume = true,
  minTotal = 1500
): AuditLogItem[] {
  if (!enableHighVolume || liveLogs.length >= minTotal) {
    return liveLogs;
  }
  const needed = minTotal - liveLogs.length;
  const synthetic = getSyntheticAuditLogs(minTotal).slice(0, needed);
  return [...liveLogs, ...synthetic];
}
