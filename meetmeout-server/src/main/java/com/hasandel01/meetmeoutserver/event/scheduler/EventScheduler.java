package com.hasandel01.meetmeoutserver.event.scheduler;


import com.hasandel01.meetmeoutserver.enums.EventStatus;
import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.event.repository.EventRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventScheduler {

    private final EventRepository eventRepository;

    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void updateFinishedEvents() {
        log.info("Scheduler is started.");

        List<Event> eventList = eventRepository.findByStatus(EventStatus.ONGOING);
        LocalDateTime now = LocalDateTime.now();

            for(Event event : eventList) {
                LocalDateTime eventEndDateTime = LocalDateTime.of(event.getEndDate(), event.getEndTime());

                if(eventEndDateTime.isBefore(now)) {
                    event.setStatus(EventStatus.ENDED);
                    eventRepository.save(event);
                    log.info("Event " + event.getTitle() + " has been ended.");
                }

            }
    }

}
