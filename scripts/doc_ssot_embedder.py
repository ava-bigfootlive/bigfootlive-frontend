#!/usr/bin/env python3
"""
SSOT Documentation Embedder
Dynamically embeds Single Source of Truth data into documentation files
using template markers.
"""

import yaml
import re
import os
import sys
from pathlib import Path

class SSOTEmbedder:
    def __init__(self, ssot_file_path):
        """Initialize with SSOT configuration file."""
        self.ssot_file_path = Path(ssot_file_path)
        self.config = self._load_ssot_config()
        
    def _load_ssot_config(self):
        """Load SSOT configuration from YAML file."""
        try:
            with open(self.ssot_file_path, 'r') as file:
                return yaml.safe_load(file)
        except FileNotFoundError:
            print(f"Error: SSOT file {self.ssot_file_path} not found")
            sys.exit(1)
        except yaml.YAMLError as e:
            print(f"Error parsing YAML: {e}")
            sys.exit(1)
            
    def get_nested_value(self, key_path):
        """Get nested value from config using dot notation (e.g., 'ec2.instance_type')."""
        keys = key_path.split('.')
        value = self.config
        
        try:
            for key in keys:
                value = value[key]
            return value
        except (KeyError, TypeError):
            return f"{{ERROR: {key_path} not found}}"
            
    def embed_in_text(self, text):
        """Replace SSOT markers in text with actual values."""
        # Pattern to match {{ssot:path.to.value}}
        pattern = r'\{\{ssot:([^}]+)\}\}'
        
        def replace_marker(match):
            key_path = match.group(1)
            return str(self.get_nested_value(key_path))
            
        return re.sub(pattern, replace_marker, text)
        
    def process_file(self, file_path):
        """Process a single documentation file."""
        file_path = Path(file_path)
        
        if not file_path.exists():
            print(f"Warning: File {file_path} not found")
            return False
            
        try:
            # Read original content
            with open(file_path, 'r', encoding='utf-8') as file:
                original_content = file.read()
                
            # Embed SSOT data
            updated_content = self.embed_in_text(original_content)
            
            # Write back if content changed
            if updated_content != original_content:
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.write(updated_content)
                print(f"✅ Updated {file_path}")
                return True
            else:
                print(f"📄 No changes needed for {file_path}")
                return False
                
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            return False
            
    def process_directory(self, directory_path, file_patterns=None):
        """Process all documentation files in a directory."""
        if file_patterns is None:
            file_patterns = ['*.md', '*.rst', '*.txt']
            
        directory_path = Path(directory_path)
        processed_files = []
        
        for pattern in file_patterns:
            for file_path in directory_path.rglob(pattern):
                if self.process_file(file_path):
                    processed_files.append(file_path)
                    
        return processed_files
        
    def create_sample_template(self, output_path):
        """Create a sample documentation template with SSOT markers."""
        template_content = f'''# EC2 Backend Architecture

> **Note**: This document is auto-generated from our Single Source of Truth (SSOT) configuration.
> To update values, modify `{self.ssot_file_path}` and run the embedding script.

## Deployment Configuration

- **Deployment Type**: {{{{ssot:deployment_type}}}}
- **Platform**: {{{{ssot:platform}}}}
- **Launch Type**: {{{{ssot:launch_type}}}}
- **Region**: {{{{ssot:region}}}}
- **Autoscaling**: {{{{ssot:autoscaling}}}}

## EC2 Instance Details

- **Instance Type**: {{{{ssot:ec2.instance_type}}}}
- **Minimum Capacity**: {{{{ssot:ec2.min_capacity}}}}
- **Maximum Capacity**: {{{{ssot:ec2.max_capacity}}}}
- **Desired Capacity**: {{{{ssot:ec2.desired_capacity}}}}
- **AMI ID**: {{{{ssot:ec2.ami_id}}}}

## ECS Configuration

- **Cluster Name**: {{{{ssot:ecs.cluster_name}}}}
- **Service Name**: {{{{ssot:ecs.service_name}}}}
- **Task Family**: {{{{ssot:ecs.task_definition_family}}}}
- **Task CPU**: {{{{ssot:ecs.task.cpu}}}}
- **Task Memory**: {{{{ssot:ecs.task.memory}}}}

## Auto Scaling

- **Target CPU Utilization**: {{{{ssot:autoscaling_config.target_cpu_utilization}}}}%
- **Target Memory Utilization**: {{{{ssot:autoscaling_config.target_memory_utilization}}}}%
- **Scale Up Cooldown**: {{{{ssot:autoscaling_config.scale_up_cooldown}}}} seconds
- **Scale Down Cooldown**: {{{{ssot:autoscaling_config.scale_down_cooldown}}}} seconds

## Network Configuration

- **VPC CIDR**: {{{{ssot:network.vpc_cidr}}}}
- **Public Subnets**: 
  {{{{ssot:network.public_subnets}}}}
- **Private Subnets**: 
  {{{{ssot:network.private_subnets}}}}

## Security

- **Encryption at Rest**: {{{{ssot:security.encryption_at_rest}}}}
- **Encryption in Transit**: {{{{ssot:security.encryption_in_transit}}}}
- **EC2 Instance Role**: {{{{ssot:security.iam_roles.ec2_instance_role}}}}
- **ECS Task Role**: {{{{ssot:security.iam_roles.ecs_task_role}}}}

## Performance Targets

- **Response Time (P95)**: {{{{ssot:performance.response_time_p95}}}}
- **Throughput**: {{{{ssot:performance.throughput_rps}}}} RPS
- **Availability Target**: {{{{ssot:performance.availability_target}}}}
- **Error Rate Threshold**: {{{{ssot:performance.error_rate_threshold}}}}

## Monitoring

- **CloudWatch Log Group**: {{{{ssot:monitoring.cloudwatch.log_group}}}}
- **Log Retention**: {{{{ssot:monitoring.cloudwatch.log_retention_days}}}} days

---

**Last Updated**: {{{{ssot:metadata.last_updated}}}}
**Version**: {{{{ssot:metadata.version}}}}
**Owner**: {{{{ssot:metadata.owner}}}}

*This document is automatically synchronized with our SSOT configuration.*
'''
        
        with open(output_path, 'w', encoding='utf-8') as file:
            file.write(template_content)
        print(f"📝 Created sample template at {output_path}")
        
        # Process the template to embed actual values
        self.process_file(output_path)

def main():
    """Main function to run the SSOT embedder."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Embed SSOT data into documentation')
    parser.add_argument('--ssot', default='docs/architecture/ec2_backend.yaml',
                       help='Path to SSOT YAML file')
    parser.add_argument('--file', help='Process single file')
    parser.add_argument('--dir', help='Process directory (default: docs/)')
    parser.add_argument('--create-template', help='Create sample template file')
    
    args = parser.parse_args()
    
    # Initialize embedder
    embedder = SSOTEmbedder(args.ssot)
    
    if args.create_template:
        embedder.create_sample_template(args.create_template)
    elif args.file:
        embedder.process_file(args.file)
    else:
        directory = args.dir or 'docs/'
        processed = embedder.process_directory(directory)
        print(f"\n📊 Processed {len(processed)} files")
        
if __name__ == '__main__':
    main()
