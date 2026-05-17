// app/lib/resources.ts
export type Resource = {
    type: "listen" | "read";
    title: string;
    subtitle: string;
    link: string;
    coverBg: string;
    coverText: string;
  };
  
  export const RESOURCE_MAP: Record<string, Resource[]> = {
    "Postpartum depression/anxiety": [
      {
        type: "listen",
        title: "Mom and Mind",
        subtitle: "Dr. Kat — postpartum depression & anxiety",
        link: "https://www.momandmind.com/podcast",
        coverBg: "#ddd4e8",
        coverText: "Mom\n&\nMind",
      },
      {
        type: "read",
        title: "This Isn't What I Expected",
        subtitle: "Karen Kleiman & Valerie Davis Raskin",
        link: "https://www.goodreads.com/book/show/161763.This_Isn_t_What_I_Expected",
        coverBg: "#e8e2d4",
        coverText: "This\nIsn't\nWhat I\nExpected",
      },
      {
        type: "read",
        title: "Good Moms Have Scary Thoughts",
        subtitle: "Karen Kleiman",
        link: "https://www.goodreads.com/book/show/35721453-good-moms-have-scary-thoughts",
        coverBg: "#d4e4d8",
        coverText: "Good\nMoms\nHave\nScary\nThoughts",
      },
    ],
  
    "NICU parents": [
      {
        type: "listen",
        title: "Empowering NICU Parents",
        subtitle: "Nicole Nyberg — for NICU families",
        link: "https://www.empoweringnicuparents.com/podcast",
        coverBg: "#d4dce8",
        coverText: "NICU\nParents",
      },
      {
        type: "read",
        title: "Preemie Parents",
        subtitle: "Lori Arnold-Rothe — NICU & beyond",
        link: "https://www.goodreads.com/book/show/25302895-preemie-parents",
        coverBg: "#e8e2d4",
        coverText: "Preemie\nParents",
      },
    ],
  
    "First-time parents": [
      {
        type: "listen",
        title: "Good Inside with Dr. Becky",
        subtitle: "Dr. Becky Kennedy — evidence-based parenting",
        link: "https://www.goodinside.com/podcast",
        coverBg: "#d4e4d8",
        coverText: "Good\nInside",
      },
      {
        type: "listen",
        title: "Pregnancy Podcast",
        subtitle: "Evidence-based info for new parents",
        link: "https://pregnancypodcast.com",
        coverBg: "#e8e2d4",
        coverText: "Pregnancy\nPodcast",
      },
      {
        type: "read",
        title: "The Whole-Brain Child",
        subtitle: "Daniel J. Siegel & Tina Payne Bryson",
        link: "https://www.goodreads.com/book/show/10353369-the-whole-brain-child",
        coverBg: "#ddd4e8",
        coverText: "The\nWhole-\nBrain\nChild",
      },
    ],
  
    "Balancing careers and parenting": [
      {
        type: "read",
        title: "Drop the Ball",
        subtitle: "Tiffany Dufu — achieving more by doing less",
        link: "https://www.goodreads.com/book/show/28815513-drop-the-ball",
        coverBg: "#e8e2d4",
        coverText: "Drop\nthe\nBall",
      },
      {
        type: "listen",
        title: "Good Inside with Dr. Becky",
        subtitle: "Parenting & identity — for working parents",
        link: "https://www.goodinside.com/podcast",
        coverBg: "#d4e4d8",
        coverText: "Good\nInside",
      },
      {
        type: "read",
        title: "Overwhelmed",
        subtitle: "Brigid Schulte — work, love & play",
        link: "https://www.goodreads.com/book/show/17736980-overwhelmed",
        coverBg: "#ddd4e8",
        coverText: "Over-\nwhelmed",
      },
    ],
  
    "Single parents": [
      {
        type: "listen",
        title: "Good Inside with Dr. Becky",
        subtitle: "Dr. Becky Kennedy — parenting with less support",
        link: "https://www.goodinside.com/podcast",
        coverBg: "#d4e4d8",
        coverText: "Good\nInside",
      },
      {
        type: "read",
        title: "The Gift of Single Parenting",
        subtitle: "Lori Brizendine",
        link: "https://www.goodreads.com/book/show/6391768-the-gift-of-single-parenting",
        coverBg: "#e8e2d4",
        coverText: "Single\nParent-\ning",
      },
    ],
  
    "IVF": [
      {
        type: "read",
        title: "Expecting Better",
        subtitle: "Emily Oster — data-driven pregnancy",
        link: "https://www.goodreads.com/book/show/16158576-expecting-better",
        coverBg: "#e8e2d4",
        coverText: "Expecting\nBetter",
      },
      {
        type: "listen",
        title: "The Egg Whisperer Show",
        subtitle: "Dr. Aimee Eyvazzadeh — fertility & IVF",
        link: "https://www.draimee.org/podcast",
        coverBg: "#ddd4e8",
        coverText: "The Egg\nWhis-\nperer",
      },
    ],
  
    "Pregnancy loss & miscarriage": [
      {
        type: "listen",
        title: "Pregnancy After Loss Support",
        subtitle: "Navigating grief and healing",
        link: "https://pregnancyafterlosssupport.com/podcast",
        coverBg: "#ddd4e8",
        coverText: "After\nLoss",
      },
      {
        type: "read",
        title: "An Exact Replica of a Figment of My Imagination",
        subtitle: "Elizabeth McCracken — a memoir of loss",
        link: "https://www.goodreads.com/book/show/3063444-an-exact-replica-of-a-figment-of-my-imagination",
        coverBg: "#e8e2d4",
        coverText: "An\nExact\nReplica",
      },
    ],
  
    "Parents of neurodivergent children": [
      {
        type: "listen",
        title: "Tilt Parenting",
        subtitle: "Debbie Reber — for differently wired kids",
        link: "https://tiltparenting.com/podcast",
        coverBg: "#d4e4d8",
        coverText: "Tilt\nParent-\ning",
      },
      {
        type: "read",
        title: "Differently Wired",
        subtitle: "Debbie Reber — raising an atypical child",
        link: "https://www.goodreads.com/book/show/36596089-differently-wired",
        coverBg: "#e8e2d4",
        coverText: "Differ-\nently\nWired",
      },
    ],
  
    "Parents of autistic children": [
      {
        type: "listen",
        title: "Tilt Parenting",
        subtitle: "Debbie Reber — for differently wired kids",
        link: "https://tiltparenting.com/podcast",
        coverBg: "#d4e4d8",
        coverText: "Tilt\nParent-\ning",
      },
      {
        type: "read",
        title: "Ten Things Every Child with Autism Wishes You Knew",
        subtitle: "Ellen Notbohm",
        link: "https://www.goodreads.com/book/show/231525.Ten_Things_Every_Child_with_Autism_Wishes_You_Knew",
        coverBg: "#e8e2d4",
        coverText: "Ten\nThings",
      },
    ],
  
    "Immigrant parents": [
      {
        type: "read",
        title: "The Namesake",
        subtitle: "Jhumpa Lahiri — identity across generations",
        link: "https://www.goodreads.com/book/show/33917.The_Namesake",
        coverBg: "#ddd4e8",
        coverText: "The\nName-\nsake",
      },
      {
        type: "listen",
        title: "Good Inside with Dr. Becky",
        subtitle: "Parenting across cultures",
        link: "https://www.goodinside.com/podcast",
        coverBg: "#d4e4d8",
        coverText: "Good\nInside",
      },
    ],
  
    "Breastfeeding/Pumping/Formula feeding": [
      {
        type: "listen",
        title: "The Boob Group",
        subtitle: "Breastfeeding support for new moms",
        link: "https://www.newmommymedia.com/the-boob-group",
        coverBg: "#e8e2d4",
        coverText: "The\nBoob\nGroup",
      },
      {
        type: "read",
        title: "The Womanly Art of Breastfeeding",
        subtitle: "La Leche League International",
        link: "https://www.goodreads.com/book/show/6554318-the-womanly-art-of-breastfeeding",
        coverBg: "#ddd4e8",
        coverText: "Woman-\nly Art",
      },
    ],
  
    "Planning to conceive soon": [
      {
        type: "read",
        title: "Expecting Better",
        subtitle: "Emily Oster — data-driven pregnancy",
        link: "https://www.goodreads.com/book/show/16158576-expecting-better",
        coverBg: "#e8e2d4",
        coverText: "Expecting\nBetter",
      },
      {
        type: "listen",
        title: "The Egg Whisperer Show",
        subtitle: "Dr. Aimee Eyvazzadeh — fertility & conception",
        link: "https://www.draimee.org/podcast",
        coverBg: "#ddd4e8",
        coverText: "The Egg\nWhis-\nperer",
      },
    ],
  
    "Co-parenting after divorce": [
      {
        type: "read",
        title: "Co-Parenting Works!",
        subtitle: "Tammy Daughtry",
        link: "https://www.goodreads.com/book/show/13414440-co-parenting-works",
        coverBg: "#e8e2d4",
        coverText: "Co-\nParent-\ning\nWorks",
      },
      {
        type: "listen",
        title: "Good Inside with Dr. Becky",
        subtitle: "Parenting through family transitions",
        link: "https://www.goodinside.com/podcast",
        coverBg: "#d4e4d8",
        coverText: "Good\nInside",
      },
    ],
  };
  
  export const DEFAULT_RESOURCES: Resource[] = [
    {
      type: "listen",
      title: "Good Inside with Dr. Becky",
      subtitle: "Dr. Becky Kennedy — thoughtful parenting",
      link: "https://www.goodinside.com/podcast",
      coverBg: "#d4e4d8",
      coverText: "Good\nInside",
    },
    {
      type: "listen",
      title: "Mom and Mind",
      subtitle: "Postpartum mental health & beyond",
      link: "https://www.momandmind.com/podcast",
      coverBg: "#ddd4e8",
      coverText: "Mom\n&\nMind",
    },
    {
      type: "read",
      title: "The Whole-Brain Child",
      subtitle: "Daniel J. Siegel & Tina Payne Bryson",
      link: "https://www.goodreads.com/book/show/10353369-the-whole-brain-child",
      coverBg: "#e8e2d4",
      coverText: "The\nWhole-\nBrain\nChild",
    },
  ];
  
  export function getResourcesForCategories(categories: string[]): Resource[] {
    const seen = new Set<string>();
    const results: Resource[] = [];
  
    for (const category of categories) {
      const categoryResources = RESOURCE_MAP[category] || [];
      for (const resource of categoryResources) {
        if (!seen.has(resource.title)) {
          seen.add(resource.title);
          results.push(resource);
        }
        if (results.length >= 3) break;
      }
      if (results.length >= 3) break;
    }
  
    if (results.length < 3) {
      for (const resource of DEFAULT_RESOURCES) {
        if (!seen.has(resource.title)) {
          seen.add(resource.title);
          results.push(resource);
        }
        if (results.length >= 3) break;
      }
    }
  
    return results.slice(0, 3);
  }