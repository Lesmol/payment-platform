package com.lvmp.usermanagement.grpc;

import io.grpc.Status;
import io.grpc.StatusException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.grpc.server.exception.GrpcExceptionHandler;
import org.springframework.stereotype.Component;

// Returning null leaves the exception to the default handling (UNKNOWN)
@Slf4j
@Component
public class GrpcExceptionHandlers implements GrpcExceptionHandler {

    @Override
    public StatusException handleException(Throwable e) {
        if (e instanceof IllegalArgumentException) {
            log.warn(e.getMessage());
            return Status.INVALID_ARGUMENT.withDescription(e.getMessage()).asException();
        }
        log.error(e.getMessage(), e);
        return null;
    }
}
