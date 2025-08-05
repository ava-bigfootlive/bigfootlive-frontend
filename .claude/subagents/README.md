# BigfootLive Claude Code Subagents

This directory contains specialized AI subagents for BigfootLive streaming platform development. Each subagent is designed to handle specific aspects of our development workflow while maintaining our high code quality standards.

## 🎯 Active Subagents

### 1. **bigfoot-frontend-dev** 
**Specialization**: React 19 + TypeScript + Tailwind CSS streaming platform UI development
- Video player components with HLS/DASH support
- Real-time features (chat, polls, viewer interactions)
- Performance optimization for video-heavy interfaces
- Mobile-first responsive design for streaming
- Accessibility compliance (WCAG 2.1 AA)

**Use When**: Building UI components, implementing streaming features, optimizing performance

### 2. **bigfoot-quality-enforcer**
**Specialization**: Code quality, standards enforcement, and automated quality gates
- TypeScript strict mode compliance
- React best practices and patterns
- Streaming-specific performance monitoring
- Accessibility testing automation
- CI/CD pipeline integration

**Use When**: Code reviews, setting up quality gates, enforcing coding standards

### 3. **bigfoot-api-developer**
**Specialization**: API design, real-time communications, and backend integration
- Streaming protocol integration (HLS/DASH)
- WebSocket real-time communication
- AWS Cognito authentication flows
- Media processing API design
- Performance and security optimization

**Use When**: Integrating APIs, building real-time features, handling authentication

## 🚀 Usage Patterns

### **Feature Development Workflow**
```bash
# 1. Start with frontend development
@bigfoot-frontend-dev Build a video player component with quality controls

# 2. Integrate with backend APIs  
@bigfoot-api-developer Add real-time chat integration to the video player

# 3. Quality assurance and review
@bigfoot-quality-enforcer Review the video player component for standards compliance
```

### **Code Review Process**
```bash
# Comprehensive review workflow
@bigfoot-quality-enforcer Review this pull request for BigfootLive standards
@bigfoot-frontend-dev Check accessibility compliance for streaming interface
@bigfoot-api-developer Validate API integration patterns
```

### **Performance Optimization**
```bash
# Streaming-specific optimization
@bigfoot-frontend-dev Optimize video player for mobile devices
@bigfoot-api-developer Reduce latency for real-time chat features
@bigfoot-quality-enforcer Analyze bundle size impact
```

## 🎨 Customization for BigfootLive

Each subagent is specifically configured for our streaming platform needs:

- **Tech Stack Alignment**: React 19, TypeScript, Tailwind CSS, Radix UI
- **Streaming Focus**: Video players, real-time features, media processing
- **Quality Standards**: 90%+ test coverage, accessibility compliance, performance optimization
- **Architecture Patterns**: Component composition, type safety, error boundaries

## 📈 Benefits

### **Specialized Expertise**
- Deep knowledge of streaming platform requirements
- Context-aware code suggestions and optimizations
- Industry best practices for video streaming applications

### **Consistency Across Team**
- Unified coding standards and patterns
- Automated quality enforcement
- Predictable code structure and organization

### **Development Velocity**
- Reduced context switching between different development concerns
- Proactive identification of issues before code review
- Streamlined workflow for common streaming platform tasks

## 🔧 Integration with Development Tools

### **IDE Integration**
- Real-time feedback during development
- Context-aware code completion and suggestions
- Automated refactoring recommendations

### **CI/CD Pipeline**
- Automated code quality checks
- Performance regression detection
- Security vulnerability scanning

### **Documentation Generation**
- Automatic API documentation updates
- Component library documentation
- Architecture decision records

## 🎯 Future Subagent Roadmap

As BigfootLive grows, we can add specialized subagents for:
- **Mobile App Development** (React Native/Flutter)
- **DevOps & Infrastructure** (AWS deployment, monitoring)
- **Data Analytics** (Viewer metrics, performance analysis)
- **Security Auditing** (Streaming content protection, vulnerability assessment)
- **Documentation Management** (Technical writing, API docs)

## 📚 Learning Resources

- [Claude Code Subagents Guide](https://github.com/Njengah/claude-code-cheat-sheet)
- [BigfootLive Authentication Testing](./docs/TESTING_AUTHENTICATION.md)
- [Streaming Platform Architecture](./docs/ARCHITECTURE.md)

---

These subagents represent our investment in maintaining high-quality, scalable code while accelerating development velocity for BigfootLive's streaming platform.
