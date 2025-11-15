import Image from "next/image"

const education = [
  {
    school: "St. Paul University Philippines",
    degree: "Bachelor of Science in Information Technology",
    period: "2023 - Present",
    location: "Tuguegarao City, Philippines",
    description: "Currently pursuing degree in Information Technology",
    logo: "/images/SPUP-final-logo.png"
  },
  {
    school: "St. Paul University Philippines",
    degree: "Basic Education",
    period: "2016 - 2023",
    location: "Tuguegarao City, Philippines",
    description: "Completed Basic Education with competition experience on Robotics VEX IQ using Python programming",
    logo: "/images/SPUP-final-logo.png"
  }
]

export default function EducationSection() {
  return (
    <div className="space-y-3">
      {education.map((edu, index) => (
        <div key={index} className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border bg-white flex items-center justify-center p-1">
              <Image
                src={edu.logo}
                alt={`${edu.school} logo`}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm">{edu.school}</h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{edu.period}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {edu.degree} • {edu.location}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {edu.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
