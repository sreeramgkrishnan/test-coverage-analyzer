import { Scenario } from './Scenario';

export type Feature = {
    id: string;
    name: string;
    description?: string;
    scenarios: Scenario[];
}
