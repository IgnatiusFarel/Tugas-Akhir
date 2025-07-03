import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { scrape_source } from "@prisma/client";

export class UpdateScrapeConfigDto {
    @IsOptional()
    @IsEnum(scrape_source)
    platform?: scrape_source

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    field_name?: string; 

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    method?: string; 

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    selector_value?: string; 

    @IsOptional()
    @IsString()
    attribute?: string; 

}