import { Step } from './Step';
import { Tag } from './Tag';

export type Scenario = {
    id: string;
    title: string;
    steps: Step[];
    tags?: Tag[];
}
