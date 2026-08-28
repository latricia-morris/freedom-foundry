type AboveTheNoiseStrategy = {
  number: number;
  title: string;
  content: string;
  example?: string;
  exercise: string[];
};

const strategies: AboveTheNoiseStrategy[] = [
  {
    number: 1,
    title: "Specialization",
    content: "Specialization builds trust and expertise in a defined area, making your brand the go-to authority within that niche. By narrowing your focus, you can develop deep expertise, a strong reputation, and highly relevant marketing that resonates with a specific segment.",
    example: "Warby Parker specializes in affordable, stylish eyewear.",
    exercise: ["Identify a niche market you can specialize in. How can you fine-tune your offerings to better serve this market?"],
  },
  {
    number: 2,
    title: "Role Specialization",
    content: "Cater to specific organizational roles with highly tailored solutions. Understanding what key players are already doing—and helping them do it better, faster, or more efficiently—can establish your brand as an essential resource and preferred partner.",
    example: "Salesforce provides specialized solutions for sales, customer service, and marketing teams.",
    exercise: ["Identify roles within your target organizations. Develop specialized offerings for these roles."],
  },
  {
    number: 3,
    title: "Unique Sales Experience",
    content: "A unique sales experience can wow and woo customers by offering something different from competitors. Personalized service, innovative store design, or an immersive online journey can create an emotional connection that leads to repeat business and word-of-mouth referrals.",
    example: "Apple stores offer a unique, hands-on experience with knowledgeable staff and innovative store designs.",
    exercise: ["Map out your current sales experience. Identify three areas where you can create a more memorable and unique experience for your customers."],
  },
  {
    number: 4,
    title: "Micro-Niche Specialization",
    content: "Provide a very specific service that addresses a particular need. Micro-niche specialization makes your brand more relevant and indispensable to a focused group, helping you refine processes, improve efficiency, and deliver higher-quality outcomes.",
    example: "A beverage company develops plant-based protein drinks specifically for vegan athletes.",
    exercise: ["Identify an underserved market segment, research their needs and pain points, develop offerings that address these needs, and implement targeted marketing to engage this new customer base."],
  },
  {
    number: 5,
    title: "Alternative Approach",
    content: "Be the forerunner in defying industry norms and solving problems from a unique perspective. Challenging conventional wisdom can position your brand as innovative and forward-thinking while generating attention and loyalty.",
    example: "Tesla disrupted the auto industry by selling electric cars directly to consumers, bypassing dealerships.",
    exercise: ["Identify common industry approaches. What are some alternatives that aren't being explored but should be? What about the \"same ole\" is stagnating or complicating the process beyond what it needs to be? How could you shift your viewpoint to come at it from a different angle? Now, what's your solution?"],
  },
  {
    number: 6,
    title: "Hyper-targeted Messaging",
    content: "Develop messaging that resonates deeply with your target audience. Segmenting your audience and speaking to the intimate pains, fears, hopes, and aspirations of your ideal customer creates trust, relevance, and stronger engagement.",
    example: "Dove's “Real Beauty” campaign built a strong emotional connection by showing real women rather than models.",
    exercise: ["Identify your ideal customer. What do they need and want to hear from you?"],
  },
  {
    number: 7,
    title: "Blue Ocean Innovation",
    content: "Create offerings that appeal not only to people already shopping the market, but also to non-consumers and untapped segments. Uncovering unmet needs can expand your reach instead of competing for the same customers.",
    example: "Chipotle bridged the gap between full-service dining and fast food with a fast-casual meal built from fresh ingredients.",
    exercise: [
      "Identify segments of the market that are currently underserved or not served at all.",
      "Research the specific needs, preferences, and pain points of these non-consumers.",
      "Develop innovative offerings that address these unmet needs and create unique value.",
      "Implement targeted marketing strategies to reach and engage these new customer segments.",
    ],
  },
  {
    number: 8,
    title: "Innovative Pricing Structures",
    content: "Offer alternative pricing models that provide flexibility and value beyond the standard in your industry. Subscription models, pay-as-you-go plans, and tiered pricing can make an offering more accessible and reduce barriers to saying yes.",
    example: "Netflix offers unlimited streaming for a monthly fee.",
    exercise: ["Analyze your current pricing model. Explore new pricing options that could add value for your customers or navigate some of the hurdles keeping prospects from being able to pull the trigger."],
  },
  {
    number: 9,
    title: "Unique Pricing Structure",
    content: "Offer a different way of charging that adds value, such as performance-based pricing or a freemium model. Align pricing with the value customers receive rather than assuming everyone wants the cheapest option.",
    example: "Adobe transitioned from selling software licenses to a subscription model with Creative Cloud.",
    exercise: ["Review your pricing models. Experiment with alternative pricing structures that could better incentivize their \"easy button\" yes while also promoting a healthier bottom line for the long-term."],
  },
  {
    number: 10,
    title: "Rapid Market Responsiveness",
    content: "Stay ahead by quickly adapting to market changes and customer needs. Monitoring trends and feedback helps you anticipate change, pivot in real time, and meet the evolving needs of your audience.",
    example: "Zara quickly turns runway trends into affordable fashion, often within weeks.",
    exercise: ["Identify recent market changes or trends. Develop a plan to quickly adapt your offerings to these changes."],
  },
  {
    number: 11,
    title: "Distinguish by Location",
    content: "Emphasize your local roots to attract a regional client base. Positioning your brand as a local expert can build community ties, trust, and loyalty with people who prefer to support businesses contributing to their local economy.",
    example: "Blue Bottle Coffee emphasizes its local, artisanal approach in each new market it enters.",
    exercise: ["Highlight aspects of your business that are unique to your location. Develop a marketing campaign that emphasizes your local identity."],
  },
  {
    number: 12,
    title: "Proprietary Data",
    content: "Exclusive insights or data can offer value competitors cannot. Collecting, analyzing, and presenting proprietary information in a useful way can position your brand as a thought leader and essential resource.",
    example: "Gartner provides proprietary research and insights in the IT sector.",
    exercise: ["Identify unique data or insights your business can offer. Develop ways to present this data as a valuable resource to your customers."],
  },
  {
    number: 13,
    title: "Unparalleled Relationship Networks",
    content: "Leverage valuable connections and partnerships to offer unique advantages. Collaborating with industry leaders, influencers, and key partners can enhance credibility, expand reach, and create exclusive benefits.",
    example: "LinkedIn leverages its vast professional network to provide unique networking opportunities.",
    exercise: ["List your key relationships and partnerships. Brainstorm ways to leverage these connections for your customers' benefit."],
  },
  {
    number: 14,
    title: "Shared Value and Processes",
    content: "Highlight shared values and processes with your clients to build resonance. Demonstrating that you share the same principles and priorities deepens trust, loyalty, and emotional connection.",
    example: "Patagonia emphasizes its commitment to environmental sustainability, resonating with eco-conscious consumers.",
    exercise: ["Identify values that resonate with your audience. Integrate these values into your processes and communicate them effectively."],
  },
  {
    number: 15,
    title: "Partnership Specific Alignment",
    content: "Leverage a specific entity or partnership to add value. Strategic partnerships that complement your strengths can create synergistic solutions and give customers benefits they cannot get elsewhere.",
    example: "Apple collaborates with Nike to offer specialized Apple Watches for fitness enthusiasts.",
    exercise: ["Think about potential partnerships that could enhance your offerings. What unique benefits could these collaborations bring to your customers, and how can you highlight these partnerships in your marketing?"],
  },
  {
    number: 16,
    title: "Quality Focus",
    content: "Commit to high standards in your products or services. Exceptional quality builds a reputation for excellence, attracts discerning customers, and can extend beyond the end product into the systems and processes that create it.",
    example: "Lush emphasizes high-quality, handmade cosmetic products.",
    exercise: ["Identify aspects of your products, services, systems, or processes that can be enhanced to meet the highest quality standards. Develop a plan to implement these improvements."],
  },
  {
    number: 17,
    title: "Exceptional Customer Experience",
    content: "Go above and beyond in customer service. Looking across the entire customer journey and improving each touchpoint can create lasting impressions, repeat business, and loyal advocates.",
    example: "Zappos is known for exceptional customer service, including free returns and 24/7 support.",
    exercise: ["Look at the overall picture of your customer's journey. Where can you enhance the experience, and what small changes can you make to surprise and delight them?"],
  },
  {
    number: 18,
    title: "Leveraging Customer Status",
    content: "Showcase impressive client lists and testimonials to build credibility and trust. Celebrate client wins genuinely, using success stories to demonstrate tangible benefits without becoming self-serving or overly salesy.",
    example: "IBM showcases its work with leading global companies to build trust.",
    exercise: ["Think about the most impactful testimonials or case studies you can share. Highlight these in your marketing materials."],
  },
  {
    number: 19,
    title: "Highlight Your Shared Journey",
    content: "Resonate through shared experiences and pathways. Relatable stories about common challenges and successes make your brand more human, trustworthy, and emotionally connected to its audience.",
    example: "TOMS shoes highlights its “one for one” program and the journey of giving shoes to those in need.",
    exercise: ["Reflect on the shared experiences you have with your customers. What stories can you tell, and how can you create content that highlights these shared experiences?"],
  },
  {
    number: 20,
    title: "Specific Business Challenge",
    content: "Focus on solving a common and challenging business problem. Positioning your brand as the solution to one specific pain point can attract prospects seeking targeted expertise.",
    example: "QuickBooks targets small business owners' need for simplified accounting solutions.",
    exercise: ["Identify the most pressing challenge your target audience faces. What one problem can you solve really well? Develop solutions and communicate your expertise in solving this challenge."],
  },
  {
    number: 21,
    title: "Industry Recognized Expertise",
    content: "Leverage the reputation of industry experts associated with your brand. Expert endorsements, collaborations, and insights can enhance authority and attract customers who value expert opinions.",
    example: "Tony Robbins uses his personal brand and expertise to sell seminars and books.",
    exercise: ["Identify industry experts within your network. Highlight their expertise and association with your brand."],
  },
  {
    number: 22,
    title: "Exclusive Community Building",
    content: "Foster an exclusive community where customers connect, share experiences, and access exclusive content or events. A sense of belonging positions your brand as a hub for like-minded individuals and encourages loyalty and advocacy.",
    example: "Peloton built a strong community through live classes and social features that let members connect and compete.",
    exercise: ["Identify your ideal community members.", "Brainstorm exclusive content or events for this audience.", "Plan and implement a community-building strategy."],
  },
  {
    number: 23,
    title: "Brand Personality",
    content: "Develop a relatable, human brand personality that emotionally connects with your audience. A distinct voice and character can break away from cold, corporate branding and create personal connection.",
    example: "Dollar Shave Club uses humor and a casual tone to connect with its audience.",
    exercise: ["Identify the traits and characteristics that best represent your brand. Develop a communication approach that consistently showcases these traits and connects with your audience."],
  },
  {
    number: 24,
    title: "Outcome-focused",
    content: "Emphasize the results customers can achieve with your products or services. Clear evidence of tangible outcomes helps potential customers see the benefits and understand why they should choose you.",
    example: "Nike's Run Club and Training Club apps give users workouts, progress sharing, and community challenges.",
    exercise: [
      "Identify key outcomes your customers achieve with your offerings. Develop messaging that highlights these outcomes.",
      "Cue customers that the outcome is within reach and will not involve excessive hoops.",
      "Describe a credible, near-term result rather than an overwhelming promise.",
    ],
  },
  {
    number: 25,
    title: "Contrarian Approach",
    content: "Stand out by going against industry norms in visual appearance and messaging. Challenging the status quo can capture attention and appeal to customers looking for something different and innovative.",
    example: "Virgin America used bright, non-traditional branding to stand out in the airline industry.",
    exercise: ["Identify industry norms in your branding and messaging. Brainstorm ways to break these norms and stand out."],
  },
  {
    number: 26,
    title: "Accomplishment Alignment",
    content: "Highlight significant industry achievements or contributions. A clear narrative about meaningful milestones can make accomplishments part of your brand's credibility and identity.",
    example: "SpaceX highlights its milestones in space travel and technology.",
    exercise: ["List your key accomplishments and contributions. Develop a narrative that highlights these achievements in your branding."],
  },
  {
    number: 27,
    title: "Unique Distribution Method",
    content: "Innovate in how you get products to customers. A novel way to purchase or receive an offering can make the brand more accessible, convenient, and memorable.",
    example: "Warby Parker's home try-on program allows customers to try glasses before buying.",
    exercise: ["Analyze your current distribution methods. Develop innovative ways to enhance your distribution strategy."],
  },
  {
    number: 28,
    title: "Combining Differentiation Strategies",
    content: "Mix multiple strategies to create a unique, powerful approach. Integrating complementary tactics can create a cohesive strategy that sets your brand apart on multiple fronts.",
    example: "Apple combines quality focus, unique sales experience, and brand personality.",
    exercise: ["Select two or more differentiation strategies. Brainstorm how you can combine them to enhance your brand's uniqueness."],
  },
  {
    number: 29,
    title: "Homage to Heritage Differentiation",
    content: "Integrate elements of cultural heritage into products, services, and marketing in an authentic and respectful manner. Celebrating traditions, customs, and histories can create a rich identity and a meaningful emotional connection.",
    example: "WEPA for Jesus integrates Puerto Rican heritage and traditional foods into its ministry outreach.",
    exercise: [
      "Identify the cultural heritage elements that resonate with your target audience.",
      "Research the traditions, customs, and history of these cultural groups to understand their significance.",
      "Integrate these elements into your brand's products, services, and marketing efforts in an authentic and respectful manner.",
    ],
  },
  {
    number: 30,
    title: "Community Builder Differentiation",
    content: "Differentiate your brand while intentionally contributing to the betterment of the community. The guide calls for real, raw, authentic leadership and meaningful action—not benevolence performed for social media. Keep it simple, honest, and aligned with a vision people can genuinely share.",
    exercise: [
      "Identify the community benefit initiatives that resonate with your company's values. Highlight ones that overlap with your ICA's values.",
      "Research the needs and opportunities within your community to understand where your efforts can have the most impact.",
      "Integrate these initiatives into your brand’s operations, marketing, and communications in an authentic and meaningful manner.",
    ],
  },
  {
    number: 31,
    title: "Customer Co-Creation",
    content: "Involve customers in the creation and development of products or services. Inviting customers to contribute ideas boosts engagement, aligns offerings with customer desires, and fosters a sense of ownership and connection.",
    example: "Lay's “Do Us a Flavor” campaign invites customers to submit new chip flavors; winning ideas are produced and sold.",
    exercise: [
      "Identify the customers you could invite into the creation and development of your products or services.",
      "Design a respectful way to gather, evaluate, and act on their ideas.",
      "Plan how you will share the resulting product, service, or community story with participants.",
    ],
  },
];

const onlinessFields = [
  {
    field_id: "above-noise-onliness-statement",
    label: "Our [offer] is the only [category] that [benefit].",
    type: "text_long" as const,
    helper_text: "Fill in the blanks, then review and refine your statement until it is clear and compelling.",
  },
];

export function buildAboveTheNoisePages() {
  return [
    {
      page_id: "above-noise-onliness",
      title: "Start here: The Onliness Statement",
      content: "Marty Neumeier's “Onliness Statement” template forces you to be concise about what you do exceptionally well, particularly in contrast to what is already available. Write it several ways, walk away, then return to it from the viewpoint of your target audience.",
      fields: onlinessFields,
    },
    ...strategies.map((strategy) => ({
      page_id: `above-noise-strategy-${strategy.number}`,
      title: `${strategy.number}. ${strategy.title}`,
      content: `${strategy.content}${strategy.example ? `\n\nExample: ${strategy.example}` : ""}`,
      fields: strategy.exercise.map((label, index) => ({
        field_id: `above-noise-${strategy.number}-${index + 1}`,
        label,
        type: "text_long" as const,
        helper_text: index === 0 && strategy.exercise.length > 1 ? "Work through each step, then use the next page to continue." : undefined,
      })),
    })),
    {
      page_id: "above-noise-evaluate",
      title: "Evaluate your differentiation ideas",
      content: "Assess each potential differentiator for value, distinctiveness, achievability, and defensibility. Select the ideas that provide real value and can sustainably set your brand apart.",
      fields: [
        { field_id: "above-noise-evaluate-list", label: "List your potential differentiators.", type: "text_long" as const },
        { field_id: "above-noise-evaluate-top-three", label: "Use value to audience, difference to competition, achievability, and defensibility to select your top three differentiators.", type: "text_long" as const },
      ],
    },
    {
      page_id: "above-noise-combine",
      title: "Combine creative and strategic thinking",
      content: "Start with a broad list, refine the most promising ideas, experiment with combinations, and evaluate the potential. Then strategize where your differentiators will be leveraged and execute on the plan.",
      fields: [
        { field_id: "above-noise-combine-brainstorm", label: "List all potential differentiators from your brainstorming session.", type: "text_long" as const },
        { field_id: "above-noise-combine-refine", label: "Combine and refine the ideas into a unique differentiator.", type: "text_long" as const },
        { field_id: "above-noise-combine-evaluate", label: "Evaluate the combined ideas using value, distinctiveness, achievability, and defensibility.", type: "text_long" as const },
        { field_id: "above-noise-combine-execute", label: "Strategize how and where your differentiators will be leveraged, then define your next action.", type: "text_long" as const },
      ],
    },
  ];
}
