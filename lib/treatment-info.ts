export interface Treatment {
  id: string;
  name: string;
  price: string;
  duration?: string;
  description: string;
}

export const TREATMENTS: Treatment[] = [
  {
    id: "checkup",
    name: "New patient checkup",
    price: "Free consultation",
    description: "Initial consultation and checkup."
  },
  {
    id: "panoramic_xray",
    name: "Panoramic X-ray",
    price: "8,000 HUF",
    duration: "~5 minutes",
    description: "Full mouth scan showing all teeth, roots, jaw, and bone levels. Takes ~5 minutes. Used to diagnose hidden decay, bone loss, or impacted teeth. Often done on first visit."
  },
  {
    id: "small_xray",
    name: "Small (periapical) X-ray",
    price: "4,000 HUF",
    duration: "2-3 minutes",
    description: "Targets a specific tooth or area. Checks root tips, decay between teeth, or monitors a treated tooth. Takes 2–3 minutes."
  },
  {
    id: "hygiene",
    name: "Oral hygiene / scale & polish",
    price: "From 15,000 HUF",
    duration: "45-60 minutes",
    description: "Done by a hygienist using an ultrasonic scaler, then polishing. Takes 45–60 minutes. Recommended every 6 months. Mild sensitivity possible for 1–2 days after."
  },
  {
    id: "white_filling",
    name: "White (composite) fillings",
    price: "From 22,500 HUF",
    duration: "30-45 minutes",
    description: "Tooth-coloured resin matched to natural shade. Decay removed, filling bonded and cured with UV light. Takes 30–45 minutes. Local anaesthetic used — numbing wears off in 1–2 hours. Patient can eat and drink normally after. Lasts 5–10 years."
  },
  {
    id: "root_canal",
    name: "Root canal treatment",
    price: "From 25,000 HUF",
    duration: "1-2 appointments of 60-90 minutes each",
    description: "Removes infected or dead pulp from inside the tooth to save it from extraction. Takes 1–2 appointments of 60–90 minutes each. Local anaesthetic used — minimal pain. Crown usually recommended afterward."
  },
  {
    id: "extraction_simple",
    name: "Tooth extraction (simple)",
    price: "From 17,500 HUF",
    duration: "20-40 minutes",
    description: "Fully visible tooth removed under local anaesthetic in 20–40 minutes. Stitches sometimes needed. Some swelling and tenderness normal for 2–3 days after. Aftercare instructions always provided."
  },
  {
    id: "wisdom_tooth_removal",
    name: "Wisdom tooth removal (impacted)",
    price: "45,000 HUF",
    duration: "30-60 minutes",
    description: "Surgical removal of a tooth that hasn't fully emerged or is growing at an angle. Requires cutting the gum. Takes 30–60 minutes under local anaesthetic. Swelling normal for 3–5 days."
  },
  {
    id: "veneer",
    name: "Dental veneer (porcelain/composite)",
    price: "From 34,900 HUF per tooth",
    description: "Thin shell bonded to the front of a tooth to improve colour, shape, or size. Two appointments — prep & impressions (1hr), then fitting (1hr). Small amount of enamel removed, so permanent. Lasts 10–15 years."
  },
  {
    id: "inlay_onlay",
    name: "Inlay / Onlay",
    price: "From 72,000 HUF",
    description: "Custom-made filling for larger cavities, made in a lab from ceramic or composite. More durable than a standard filling. Two appointments. Lasts 15–20 years."
  },
  {
    id: "metal_crown",
    name: "Metal-based crown",
    price: "55,000 HUF",
    description: "Cap that fully covers a damaged or root-treated tooth. Strong and durable, suitable for back teeth. Two appointments — tooth prep & impressions, then crown fitting."
  },
  {
    id: "zirconium_crown",
    name: "Zirconium crown (metal-free)",
    price: "From 99,000 HUF",
    description: "Tooth-coloured crown made from high-strength ceramic. Ideal for front teeth or patients with metal sensitivity. Same two-appointment process."
  },
  {
    id: "lumineers",
    name: "Lumineers® veneer",
    price: "250,000 HUF per tooth",
    description: "Ultra-thin branded veneers requiring minimal to no enamel removal. Reversible in some cases. Two appointments. Premium cosmetic option."
  },
  {
    id: "metal_braces",
    name: "Metal braces",
    price: "225,000 HUF per arch",
    description: "Fixed brackets and wires that gradually move teeth into alignment. Treatment duration 12–24 months. Monthly activation appointments (12,000 HUF/arch). Retainer required after."
  },
  {
    id: "dental_bridge",
    name: "Dental bridge (3-unit)",
    price: "From 55,000 HUF per crown unit",
    description: "Replacement tooth held in place by crowns on the two adjacent teeth. Two appointments — prep & impressions, then fitting (~2 weeks including lab time). Lasts 10–15 years with good care."
  },
  {
    id: "dental_implant",
    name: "Dental implant",
    price: "Price on consultation",
    description: "Titanium post surgically placed into the jawbone to replace a missing tooth root. Bone heals around it over 3–6 months, then a crown is fitted on top. Full process takes 4–9 months. Requires initial consultation with panoramic X-ray or CT scan. Not suitable for everyone — bone density assessment needed first."
  },
  {
    id: "childrens_checkup",
    name: "Children's checkup",
    price: "Contact clinic",
    duration: "~20 minutes",
    description: "Gentle exam for under-18 patients. Checks tooth development, decay, and bite alignment. Oral hygiene advice given to both child and parent. Takes ~20 minutes. Parents welcome to stay throughout."
  }
];
