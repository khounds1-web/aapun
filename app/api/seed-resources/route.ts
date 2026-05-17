// Run this once to seed the resources table
// app/api/seed-resources/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const INITIAL_RESOURCES = [
  // Postpartum depression/anxiety
  { category: "Postpartum depression/anxiety", type: "listen", title: "Mom and Mind", subtitle: "Dr. Kat — postpartum depression & anxiety", link: "https://www.momandmind.com/podcast", cover_bg: "#ddd4e8", cover_text: "Mom\n&\nMind" },
  { category: "Postpartum depression/anxiety", type: "read", title: "This Isn't What I Expected", subtitle: "Karen Kleiman & Valerie Davis Raskin", link: "https://www.goodreads.com/book/show/161763", cover_bg: "#e8e2d4", cover_text: "This\nIsn't\nWhat I\nExpected" },
  { category: "Postpartum depression/anxiety", type: "read", title: "Good Moms Have Scary Thoughts", subtitle: "Karen Kleiman", link: "https://www.goodreads.com/book/show/35721453", cover_bg: "#d4e4d8", cover_text: "Good\nMoms" },

  // NICU parents
  { category: "NICU parents", type: "listen", title: "Empowering NICU Parents", subtitle: "Nicole Nyberg — for NICU families", link: "https://www.empoweringnicuparents.com/podcast", cover_bg: "#d4dce8", cover_text: "NICU\nParents" },
  { category: "NICU parents", type: "read", title: "Preemie Parents", subtitle: "Lori Arnold-Rothe — NICU & beyond", link: "https://www.goodreads.com/book/show/25302895", cover_bg: "#e8e2d4", cover_text: "Preemie\nParents" },

  // First-time parents
  { category: "First-time parents", type: "listen", title: "Good Inside with Dr. Becky", subtitle: "Dr. Becky Kennedy — evidence-based parenting", link: "https://www.goodinside.com/podcast", cover_bg: "#d4e4d8", cover_text: "Good\nInside" },
  { category: "First-time parents", type: "listen", title: "Pregnancy Podcast", subtitle: "Evidence-based info for new parents", link: "https://pregnancypodcast.com", cover_bg: "#e8e2d4", cover_text: "Pregnancy\nPodcast" },
  { category: "First-time parents", type: "read", title: "The Whole-Brain Child", subtitle: "Daniel J. Siegel & Tina Payne Bryson", link: "https://www.goodreads.com/book/show/10353369", cover_bg: "#ddd4e8", cover_text: "The\nWhole-\nBrain\nChild" },

  // Balancing careers and parenting
  { category: "Balancing careers and parenting", type: "read", title: "Drop the Ball", subtitle: "Tiffany Dufu — achieving more by doing less", link: "https://www.goodreads.com/book/show/28815513", cover_bg: "#e8e2d4", cover_text: "Drop\nthe\nBall" },
  { category: "Balancing careers and parenting", type: "listen", title: "Good Inside with Dr. Becky", subtitle: "Parenting & identity — for working parents", link: "https://www.goodinside.com/podcast", cover_bg: "#d4e4d8", cover_text: "Good\nInside" },
  { category: "Balancing careers and parenting", type: "read", title: "Overwhelmed", subtitle: "Brigid Schulte — work, love & play", link: "https://www.goodreads.com/book/show/17736980", cover_bg: "#ddd4e8", cover_text: "Over-\nwhelmed" },

  // Single parents
  { category: "Single parents", type: "listen", title: "Good Inside with Dr. Becky", subtitle: "Dr. Becky Kennedy — parenting with less support", link: "https://www.goodinside.com/podcast", cover_bg: "#d4e4d8", cover_text: "Good\nInside" },
  { category: "Single parents", type: "read", title: "The Gift of Single Parenting", subtitle: "Lori Brizendine", link: "https://www.goodreads.com/book/show/6391768", cover_bg: "#e8e2d4", cover_text: "Single\nParent-\ning" },

  // IVF
  { category: "IVF", type: "read", title: "Expecting Better", subtitle: "Emily Oster — data-driven pregnancy", link: "https://www.goodreads.com/book/show/16158576", cover_bg: "#e8e2d4", cover_text: "Expecting\nBetter" },
  { category: "IVF", type: "listen", title: "The Egg Whisperer Show", subtitle: "Dr. Aimee Eyvazzadeh — fertility & IVF", link: "https://www.draimee.org/podcast", cover_bg: "#ddd4e8", cover_text: "The Egg\nWhis-\nperer" },

  // Pregnancy loss
  { category: "Pregnancy loss & miscarriage", type: "listen", title: "Pregnancy After Loss Support", subtitle: "Navigating grief and healing", link: "https://pregnancyafterlosssupport.com/podcast", cover_bg: "#ddd4e8", cover_text: "After\nLoss" },
  { category: "Pregnancy loss & miscarriage", type: "read", title: "An Exact Replica of a Figment of My Imagination", subtitle: "Elizabeth McCracken — a memoir of loss", link: "https://www.goodreads.com/book/show/3063444", cover_bg: "#e8e2d4", cover_text: "An\nExact\nReplica" },

  // Neurodivergent
  { category: "Parents of neurodivergent children", type: "listen", title: "Tilt Parenting", subtitle: "Debbie Reber — for differently wired kids", link: "https://tiltparenting.com/podcast", cover_bg: "#d4e4d8", cover_text: "Tilt\nParent-\ning" },
  { category: "Parents of neurodivergent children", type: "read", title: "Differently Wired", subtitle: "Debbie Reber — raising an atypical child", link: "https://www.goodreads.com/book/show/36596089", cover_bg: "#e8e2d4", cover_text: "Differ-\nently\nWired" },

  // Autistic children
  { category: "Parents of autistic children", type: "listen", title: "Tilt Parenting", subtitle: "Debbie Reber — for differently wired kids", link: "https://tiltparenting.com/podcast", cover_bg: "#d4e4d8", cover_text: "Tilt\nParent-\ning" },
  { category: "Parents of autistic children", type: "read", title: "Ten Things Every Child with Autism Wishes You Knew", subtitle: "Ellen Notbohm", link: "https://www.goodreads.com/book/show/231525", cover_bg: "#e8e2d4", cover_text: "Ten\nThings" },

  // Immigrant parents
  { category: "Immigrant parents", type: "read", title: "The Namesake", subtitle: "Jhumpa Lahiri — identity across generations", link: "https://www.goodreads.com/book/show/33917", cover_bg: "#ddd4e8", cover_text: "The\nName-\nsake" },
  { category: "Immigrant parents", type: "listen", title: "Good Inside with Dr. Becky", subtitle: "Parenting across cultures", link: "https://www.goodinside.com/podcast", cover_bg: "#d4e4d8", cover_text: "Good\nInside" },

  // Breastfeeding
  { category: "Breastfeeding/Pumping/Formula feeding", type: "listen", title: "The Boob Group", subtitle: "Breastfeeding support for new moms", link: "https://www.newmommymedia.com/the-boob-group", cover_bg: "#e8e2d4", cover_text: "The\nBoob\nGroup" },
  { category: "Breastfeeding/Pumping/Formula feeding", type: "read", title: "The Womanly Art of Breastfeeding", subtitle: "La Leche League International", link: "https://www.goodreads.com/book/show/6554318", cover_bg: "#ddd4e8", cover_text: "Woman-\nly Art" },

  // Planning to conceive
  { category: "Planning to conceive soon", type: "read", title: "Expecting Better", subtitle: "Emily Oster — data-driven pregnancy", link: "https://www.goodreads.com/book/show/16158576", cover_bg: "#e8e2d4", cover_text: "Expecting\nBetter" },
  { category: "Planning to conceive soon", type: "listen", title: "The Egg Whisperer Show", subtitle: "Dr. Aimee Eyvazzadeh — fertility & conception", link: "https://www.draimee.org/podcast", cover_bg: "#ddd4e8", cover_text: "The Egg\nWhis-\nperer" },

  // Co-parenting
  { category: "Co-parenting after divorce", type: "read", title: "Co-Parenting Works!", subtitle: "Tammy Daughtry", link: "https://www.goodreads.com/book/show/13414440", cover_bg: "#e8e2d4", cover_text: "Co-\nParent-\ning\nWorks" },
  { category: "Co-parenting after divorce", type: "listen", title: "Good Inside with Dr. Becky", subtitle: "Parenting through family transitions", link: "https://www.goodinside.com/podcast", cover_bg: "#d4e4d8", cover_text: "Good\nInside" },

  // Stay at home
  { category: "Stay-at-home moms/dads", type: "listen", title: "Good Inside with Dr. Becky", subtitle: "Dr. Becky Kennedy — intentional parenting", link: "https://www.goodinside.com/podcast", cover_bg: "#d4e4d8", cover_text: "Good\nInside" },
  { category: "Stay-at-home moms/dads", type: "read", title: "The Whole-Brain Child", subtitle: "Daniel J. Siegel & Tina Payne Bryson", link: "https://www.goodreads.com/book/show/10353369", cover_bg: "#ddd4e8", cover_text: "The\nWhole-\nBrain\nChild" },

  // Unequal load
  { category: "Parenting with a partner who doesn't share the load", type: "read", title: "Drop the Ball", subtitle: "Tiffany Dufu — rebalancing the mental load", link: "https://www.goodreads.com/book/show/28815513", cover_bg: "#e8e2d4", cover_text: "Drop\nthe\nBall" },
  { category: "Parenting with a partner who doesn't share the load", type: "read", title: "Fair Play", subtitle: "Eve Rodsky — a game-changing solution for sharing domestic work", link: "https://www.goodreads.com/book/show/44071899", cover_bg: "#ddd4e8", cover_text: "Fair\nPlay" },

  // Hiring nanny
  { category: "Hiring a nanny/caregiver", type: "read", title: "The Nanny Chronicles of Hollywood", subtitle: "Sandi Kahn Shelton", link: "https://www.goodreads.com/book/show/13414440", cover_bg: "#e8e2d4", cover_text: "Nanny\nChron-\nicles" },
];

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.from("resources").insert(INITIAL_RESOURCES);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: INITIAL_RESOURCES.length });
}