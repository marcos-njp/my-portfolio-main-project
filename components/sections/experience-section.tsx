import { Briefcase, Trophy, ExternalLink } from "lucide-react"
import Link from "next/link"

const experiences = [
  {
    type: "education",
    title: "IT Student",
    organization: "School of Information Technology and Engineering",
    period: "Present",
    description: "Pursuing Bachelor of Science in Information Technology with focus on Web Development",
    icon: Briefcase
  },
  {
    type: "competition",
    title: "4th Place - Programming Skills Excellence",
    organization: "STEAM International Challenge 2018 (Competition)",
    period: "November 2018",
    location: "Shenzhen, China",
    description: "International Robotics Competition - Represented Team Philippines among 118 teams from 5 countries",
    icon: Trophy,
    proofLink: "https://www.facebook.com/StPaulUniversityPhilippines/posts/caritas-christi-urget-nos-spup-beu-robotics-team-clinches-international-awards-b/1909122265809145/"
  },
  {
    type: "competition",
    title: "5th Place - Excellence Award",
    organization: "6th Robothon National Competition (Competition)",
    period: "October 2018",
    location: "Quezon City, Philippines",
    description: "National Robotics Competition - Represented St. Paul University Philippines among 43 schools",
    icon: Trophy,
    proofLink: "https://www.facebook.com/StPaulUniversityPhilippines/posts/caritas-christi-urget-nos-spup-beu-secures-victory-in-robothon-national-competit/1867646416623397/"
  }
]

export default function ExperienceSection() {
  return (
    <div className="space-y-3">
      {experiences.map((exp, index) => (
        <div key={index} className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
              exp.type === 'competition' ? 'bg-yellow-500/10' : 'bg-primary/10'
            }`}>
              <exp.icon className={`h-5 w-5 ${
                exp.type === 'competition' ? 'text-yellow-600 dark:text-yellow-500' : 'text-primary'
              }`} />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm">{exp.title}</h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{exp.period}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {exp.organization}{exp.location ? ` • ${exp.location}` : ''}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                {exp.description}
              </p>
              
              {/* Proof Link */}
              {exp.proofLink && (
                <Link 
                  href={exp.proofLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Article
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
