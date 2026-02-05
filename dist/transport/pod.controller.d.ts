import { PodService } from './pod.service';
import { StopService } from './stop.service';
import { CreatePodDto } from './dto/create-pod.dto';
import { UpdateStopDto } from './dto/update-stop.dto';
import { PodDto } from './dto/trip.dto';
import { StopDto } from './dto/trip.dto';
export declare class PodController {
    private readonly podService;
    private readonly stopService;
    constructor(podService: PodService, stopService: StopService);
    updateStop(req: any, stopId: string, dto: UpdateStopDto): Promise<StopDto>;
    createOrUpdatePod(req: any, stopId: string, dto: CreatePodDto): Promise<PodDto>;
}
