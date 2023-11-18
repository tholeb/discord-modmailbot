import { execSync } from 'child_process';

export default function getGitCommit(): string {
	return execSync('git rev-parse --short HEAD').toString().trim();
}